import express from "express";

const app = express();
const port = Number(process.env.BACKEND_PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("BACKEND_PORT must be an integer between 1 and 65535.");
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Standalone API listening on http://localhost:${port}`);
});
