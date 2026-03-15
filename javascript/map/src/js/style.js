import { layers, namedFlavor } from "@protomaps/basemaps";

export function getColorScheme() {
  const theme =
    document.body.getAttribute("data-md-color-scheme") == "slate"
      ? "dark"
      : "light";

  return theme;
}

export function getStyle(theme) {
  if (!theme) {
    theme = getColorScheme();
  }

  const globeLayer = layers("globe", namedFlavor(theme), { lang: "en" })
    .filter(e => {
      return !e.id.includes("background");
    });

  const midwestLayer = layers("midwest", namedFlavor(theme), { lang: "en" })
    .filter(e => {
      return !e.id.includes("background");
    })
    .map(e => {
      if (e.id === "boundaries") {
        e = { ...e, filter: ["all", [">", "kind_detail", 2], ["<", "kind_detail", 8]] };
      }
      if (e.id === "roads_shields") {
        e = { ...e, minzoom: 12 };
      }
      return { ...e, id: `${e.id}-2` };
    });

  return {
    version: 8,
    sources: {
      midwest: {
        type: "vector",
        url: `${window.location.origin}/tiles/midwest.json`
      },
      globe: {
        type: "vector",
        url: `${window.location.origin}/tiles/globe.json`
      },
    },
    layers: [ ...globeLayer, ...midwestLayer ],
    sprite: `${window.location.origin}/assets/sprites/v4/${theme}`,
    glyphs: `${window.location.origin}/assets/fonts/{fontstack}/{range}.pbf`,
  };
}
