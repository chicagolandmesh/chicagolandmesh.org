#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

if [ ! -d "$ROOT_DIR/.venv" ]; then
    python3 -m venv "$ROOT_DIR/.venv"
    "$ROOT_DIR/.venv/bin/pip" install requests
fi

"$ROOT_DIR/.venv/bin/python3" "$SCRIPT_DIR/generate_devices.py" \
    --output "$ROOT_DIR/internal/data/devices.json"
