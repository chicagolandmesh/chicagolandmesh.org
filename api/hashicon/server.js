const express = require("express");
const { hashicon } = require("@emeraldpay/hashicon");
const { createCanvas, loadImage } = require("canvas");
const twemoji = require("@twemoji/api");
const { labelFromName, colorFromName, readTwemojiSvg } = require("./utils.js");

const app = express();
const port = process.env.PORT || 3000;

app.use(async (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => console.log(JSON.stringify({
    time: Date.now(),
    ip: req.ip,
    method: req.method,
    uri: req.url,
    headers: req.headers,
    status: res.statusCode,
    duration_ms: Date.now() - start,
  })));

  next();
});

app.get("/meshcore/:name", async (req, res) => {
  const name = req.params.name;

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
      ctx.font = `400 ${fontSize}px "Noto Sans"`;
      ctx.fillText(label, radius, radius);
    }
  }

  const buffer = canvas.toBuffer("image/png");
  res.setHeader("Content-Type", "image/png");
  res.send(buffer);
});

app.get("/:id", (req, res) => {
  const id = req.params.id[0] == "!" ? parseInt(req.params.id.slice(1), 16) : req.params.id;

  const canvasSize = 512;
  const iconSize = 462;
  const margin = (canvasSize - iconSize) / 2;

  const iconCanvas = createCanvas(iconSize, iconSize);
  const icon = hashicon(id, { size: iconSize, createCanvas: () => iconCanvas });
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(icon, margin, margin, iconSize, iconSize);

  const buffer = canvas.toBuffer("image/png");
  res.setHeader("Content-Type", "image/png");
  res.send(buffer);
});

const server = app.listen(port, () => {
  console.log(`running hashicon server on port ${port}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("closing hashicon server");
    process.exit(0);
  });
});
