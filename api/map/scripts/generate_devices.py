import argparse
import json
import re
import sys
from pathlib import Path

import requests


VENDOR_PREFIXES = {
    "b&q": "UnitEng",
    "canary": "Canary",
    "ebyte": "EByte",
    "elecrow": "Elecrow",
    "heltec": "Heltec",
    "lilygo": "LilyGo",
    "m5stack": "M5Stack",
    "muzi": "muzi",
    "nomadstar": "NomadStar",
    "promicro": "ProMicro",
    "radiomaster": "RadioMaster",
    "rak": "RAK",
    "rak wireless": "RAK",
    "raspberry": "Raspberry Pi",
    "raspberry pi": "Raspberry Pi",
    "rpi": "Raspberry Pi",
    "seeed": "Seeed",
    "seeed studio": "Seeed",
    "uniteng": "UnitEng",
    "waveshare": "Waveshare",
}

BLOCKED_HARDWARE = {
    "DIY V1",
    "DR-DEV",
}


def slugify(value):
    ascii_text = value.lower().replace("&", " and ")
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text)
    ascii_text = re.sub(r"-{2,}", "-", ascii_text).strip("-")
    return ascii_text


def token_key(value):
    return tuple(slugify(value).split("-"))


def normalize_display_name(name):
    name = re.sub(r"\bLILYGO\b", "LilyGo", name)
    name = re.sub(r"\bV(?=\d)", "v", name)
    name = re.sub(r"\bLora\b", "LoRa", name)
    name = re.sub(r"\bv(\d+)\.0\b", r"v\1", name)
    name = re.sub(r"^Seeed Studio\b", "Seeed", name)
    name = re.sub(r"^EBYTE\b", "EByte", name)
    name = re.sub(r"^Heltec (Heltec Wireless Paper)$", r"\1", name)
    name = re.sub(r"^(LilyGo T-Deck) \(community\)$", r"\1", name)
    name = re.sub(r"^(RAK WisBlock) / WisMesh \(RAK 4631\)$", r"\1 4631", name)
    name = re.sub(r"^(Heltec) MeshSolar / (MeshTower)$", r"\1 \2", name)
    name = re.sub(r"^RAK (RAK.*)$", r"\1", name)
    return name


def not_allowed(name):
    return name in BLOCKED_HARDWARE


def has_vendor_prefix(name):
    vendor_prefixes = get_vendor_prefixes()
    tokens = token_key(name)
    return any(tokens[: len(prefix)] == prefix for prefix in vendor_prefixes)


def add_vendor_from_tags(name, tags):
    for tag in tags:
        vendor = VENDOR_PREFIXES.get(tag.lower())
        if vendor:
            return f"{vendor} {name}"
    return name


def canonical_key(name):
    tokens = token_key(name)
    return "-".join(tokens)


def get_vendor_prefixes():
    vendors = set(VENDOR_PREFIXES)
    return {token_key(vendor) for vendor in vendors}


def get_json(source):
    response = requests.get(source, timeout=30)
    response.raise_for_status()
    return response.json()


def unify_device_list(meshcore_url, meshtastic_url):
    meshcore = get_json(meshcore_url)
    meshtastic = get_json(meshtastic_url)

    candidates = []

    for device in meshcore["device"]:
        name = device["name"]
        name = normalize_display_name(name)
        candidates.append(name)

    for device in meshtastic:
        name = device["displayName"]
        if not_allowed(name):
            continue
        if not has_vendor_prefix(name):
            name = add_vendor_from_tags(name, device.get("tags", []))
        name = normalize_display_name(name)
        candidates.append(name)

    devices = {}
    for name in candidates:
        key = canonical_key(name)
        current = devices.get(key)
        if current is None:
            devices[key] = name
        elif current != name:
            sys.stderr.write(
                f"ERROR: normalization conflict (key={key})\n"
                f"- {current}\n"
                f"+ {name}\n"
            )
            sys.exit(1)

    unified = {}
    for name in sorted(devices.values()):
        slug = slugify(name)
        unified[slug] = name

    return unified


def parse_args():
    parser = argparse.ArgumentParser(description="Merge MeshCore and Meshtastic hardware JSON into a unified slug/name list.")
    parser.add_argument( "--meshcore", default="https://github.com/meshcore-dev/flasher.meshcore.io/raw/refs/heads/main/config.json")
    parser.add_argument("--meshtastic", default="https://github.com/meshtastic/web-flasher/raw/refs/heads/main/public/data/hardware-list.json")
    parser.add_argument("--output", default="devices.json", type=Path)
    return parser.parse_args()


def main():
    args = parse_args()
    unified = unify_device_list(args.meshcore, args.meshtastic)
    args.output.write_text(json.dumps(unified, separators=(",", ":")))
    print(f"Wrote {len(unified)} devices to {args.output}")


if __name__ == "__main__":
    main()
