const express = require("express");
const { generateMeshcoreIcon, generateMeshtasticIcon } = require("./icon.js");

const app = express();
const port = process.env.PORT || 3000;

app.set("etag", false);

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

function headers(req, res, next) {
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  next();
}

const v1 = express.Router();
const v2 = express.Router();
v1.use(headers);
v2.use(headers);

v1.get("/meshcore/:name", async (req, res) => {
  const buffer = await generateMeshcoreIcon(req.params.name, {});
  res.send(buffer);
});

v2.get("/meshcore/:name", async (req, res) => {
  const buffer = await generateMeshcoreIcon(req.params.name, { fontWeight: "700" });
  res.send(buffer);
});

v1.get("/meshtastic/:id", (req, res) => {
  const id = req.params.id[0] == "!" ? parseInt(req.params.id.slice(1), 16) : req.params.id;
  const buffer = generateMeshtasticIcon(id);
  res.send(buffer);
});

app.use("/v1", v1);
app.use("/v2", v2);
app.use("/", (req, res, next) => {
  const protocol = req.path.split("/")[1];
  (protocol === "meshtastic" ? v1 : v2)(req, res, next);
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
