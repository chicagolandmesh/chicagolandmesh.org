const { hashicon } = require("@emeraldpay/hashicon");
const { createCanvas, loadImage } = require("canvas");
const twemoji = require("@twemoji/api");
const { labelFromName, colorFromName, readTwemojiSvg } = require("./utils.js");

async function generateMeshcoreIcon(name, options = {}) {
  const { fontWeight = "400" } = options;

  const canvasSize = 512;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");
  const radius = canvasSize / 2;
  const label = labelFromName(name) ?? "";
  const background = colorFromName(name);

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = background;
  ctx.fill();

  if (label.length > 0) {
    if (twemoji.test(label)) {
      const emojiCodePoint = twemoji.convert.toCodePoint(label);
      let svg = await readTwemojiSvg(emojiCodePoint);
      svg = svg.replace(
        /<svg([^>]*)>/,
        `<svg$1 width="${canvasSize / 2}" height="${canvasSize / 2}">`
      );

      const img = await loadImage("data:image/svg+xml;base64," + Buffer.from(svg).toString("base64"));

      const emojiSize = canvasSize / 2;
      const emojiPosition = radius - emojiSize / 2;
      ctx.drawImage(img, emojiPosition, emojiPosition, emojiSize, emojiSize);
    } else {
      const fontSize = Math.round(canvasSize / 2);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontWeight} ${fontSize}px "Noto Sans"`;
      ctx.fillText(label, radius, radius);
    }
  }

  return canvas.toBuffer("image/png");
}

function generateMeshtasticIcon(id, options = {}) {
  const canvasSize = 512;
  const iconSize = 462;
  const margin = (canvasSize - iconSize) / 2;

  const iconCanvas = createCanvas(iconSize, iconSize);
  const icon = hashicon(id, { size: iconSize, createCanvas: () => iconCanvas });
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(icon, margin, margin, iconSize, iconSize);

  return canvas.toBuffer("image/png");
}

module.exports = {
  generateMeshcoreIcon,
  generateMeshtasticIcon,
};
