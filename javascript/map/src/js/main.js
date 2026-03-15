import maplibregl from "maplibre-gl";

import { hasWebGL, setWebGLWarning } from "./utils.js";
import { addControls } from "./controls.js";
import { getColorScheme, getStyle } from "./style.js";
import { NodeManager } from "./node.js";
import { addBanner } from "./banner.js";

const BOTTOM_LEFT_LNGLAT = [-92.575556, 35.995556];
const TOP_RIGHT_LNGLAT = [-84.495833, 43.591667];

document.addEventListener("DOMContentLoaded", async function () {
  if (!hasWebGL()) {
    setWebGLWarning();
    return;
  }

  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  const map = new maplibregl.Map({
    container: "map",
    style: getStyle(),
    center: [-87.752, 41.839],
    zoom: 3,
    minZoom: 3,
    attributionControl: false,
    doubleClickZoom: false,
  });
  map.touchZoomRotate.disableRotation();

  map.on("style.load", () => {
    map.setProjection({ type: "globe" });
    nodeManager.setNodes();
  });

  watchTheme(map);

  const nodeManager = new NodeManager(map);
  await addControls(map, nodeManager);

  const params = new URLSearchParams(window.location.search);
  if (params.has("error") && params.has("error_description")) {
    addBanner("Encountered error on login", params.get("error_description"), {
      close: true,
      color: "#ff2424d9",
    });
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  map.once("idle", () => {
    const lastLocation = JSON.parse(localStorage.getItem("mapLastLocation"));
    const lastZoom = Number(localStorage.getItem("mapLastZoom"));

    const locationExists = Boolean(lastLocation && lastZoom);
    const withinCenter = locationExists && map.getCenter().distanceTo(lastLocation) < 300_000;

    if (withinCenter) {
      map.flyTo({ center: lastLocation, zoom: Math.min(lastZoom, 10), speed: 0.9 });
    } else {
      map.flyTo({ center: map.getCenter(), zoom: 7.5, speed: 0.9 });
    }
  });

  map.on("moveend", () => {
    localStorage.setItem("mapLastLocation", JSON.stringify(map.getCenter()));
    localStorage.setItem("mapLastZoom", map.getZoom());
  });

  let correcting = false;
  map.on("move", () => {
    if (correcting) return;

    const maxBounds = [BOTTOM_LEFT_LNGLAT, TOP_RIGHT_LNGLAT];
    const leftBound = maxBounds[0][0];
    const bottomBound = maxBounds[0][1];
    const rightBound = maxBounds[1][0];
    const topBound = maxBounds[1][1];

    const { lng, lat } = map.getCenter();

    const outsideBounds =
      lng < leftBound ||
      lng > rightBound ||
      lat < bottomBound ||
      lat > topBound;

    const maxZoom = outsideBounds ? 7 : 18;

    if (map.getZoom() > maxZoom + 0.15) {
      correcting = true;

      function stopZoomIn(e) {
        if (e.deltaY < 0 && map.getZoom() > maxZoom - 0.15) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }

      map.getCanvas().addEventListener("wheel", stopZoomIn, { passive: false, capture: true });
      map.touchZoomRotate.disable();

      requestAnimationFrame(() => {
        map.easeTo({ zoom: maxZoom, easing: (t) => 1 - Math.pow(1 - t, 3) });
        map.once("moveend", () => {
          map.touchZoomRotate.enable();
          setTimeout(() => {
            map.getCanvas().removeEventListener("wheel", stopZoomIn, { passive: false, capture: true });
          }, 500);
          correcting = false;
        });
      });
    }
  });
});

function watchTheme(map) {
  let lastColorScheme = getColorScheme();

  if (lastColorScheme === "dark") {
    document.querySelector("#map").classList.add("dark");
  }

  const observer = new MutationObserver(() => {
    const colorScheme = getColorScheme();

    if (colorScheme !== lastColorScheme) {
      lastColorScheme = colorScheme;

      map.setStyle(getStyle(colorScheme));
      document.querySelector("#map").classList.toggle("dark", colorScheme === "dark");
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-md-color-scheme"],
  });
}
