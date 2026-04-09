from pathlib import Path
import logging

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

def on_config(config):
    handle_map_injection(config)
    handle_privacy_plugin_timeout()
    return config
