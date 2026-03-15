const express = require('express');
const { hashicon } = require('@emeraldpay/hashicon');
const { createCanvas } = require('canvas');

const app = express();
const port = process.env.PORT || 3000;

app.use(async (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => console.log(JSON.stringify({
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

app.get('/:id', (req, res) => {
  const id = req.params.id[0] == '!' ? parseInt(req.params.id.slice(1), 16) : req.params.id;

  const canvasSize = 512;
  const iconSize = 462;
  const margin = (canvasSize - iconSize) / 2;

  const iconCanvas = createCanvas(iconSize, iconSize);
  const icon = hashicon(id, { size: iconSize, createCanvas: () => iconCanvas });

  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(icon, margin, margin, iconSize, iconSize);

  const buffer = canvas.toBuffer('image/png');

  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
});

const server = app.listen(port, () => {
  console.log(`running hashicon server on port ${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('closing hashicon server');
    process.exit(0);
  });
});
