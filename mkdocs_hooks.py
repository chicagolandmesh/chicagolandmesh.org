import logging
import os
from pathlib import Path

from PIL import Image

log = logging.getLogger("mkdocs")


def first_existing(*paths: Path) -> Path | None:
    return next((p for p in paths if p.exists()), None)

def handle_map_injection(config):
    js_dir = Path("docs/assets/javascripts")
    css_dir = Path("docs/assets/stylesheets")

    js_bundle = first_existing(js_dir.joinpath("map.dev.js"), *list(js_dir.glob("map.*.min.js")))
    css_bundle = first_existing(css_dir.joinpath("map.dev.css"), *list(css_dir.glob("map.*.min.css")))

    if js_bundle and css_bundle:
        config.extra["map_js_bundle"] = Path(*js_bundle.parts[1:])
        config.extra["map_css_bundle"] = Path(*css_bundle.parts[1:])
    else:
        log.fatal("Failed to inject map bundle: files could not be found")
        raise SystemExit(1)


def handle_privacy_plugin_timeout():
    try:
        import material.plugins.privacy.plugin as privacy_plugin
        privacy_plugin.DEFAULT_TIMEOUT_IN_SECS = 75
    except Exception as e:
        log.error(f"Failed to patch privacy plugin timeout: {e}")


def handle_gallery_generation():
    path = "docs/assets/images/gallery"
    preview_path = f"{path}/preview"

    if not os.path.isdir(preview_path):
        os.mkdir(preview_path)

    files = [f for f in os.listdir(path) if f.endswith(".jpg")]
    for i, file in enumerate(files):
        if not file.endswith(".jpg") or os.path.isfile(f"{preview_path}/{file}"):
            continue

        with Image.open(f"{path}/{file}") as img:
            width = 600
            height = int(img.height * (width / img.width))
            resized = img.resize((width, height), Image.Resampling.LANCZOS)
            resized.save(f"{preview_path}/{file}")
            log.info(f"Generated gallery image preview [{i+1}/{len(files)}]: {preview_path}/{file}")


def on_config(config):
    handle_map_injection(config)
    handle_gallery_generation()
    handle_privacy_plugin_timeout()
    return config
