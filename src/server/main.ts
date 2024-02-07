import express from "express";
import ViteExpress from "vite-express";

const app = express();

let counter = 0;

// use setTimeout to simulate network latency
app.get("/api/counter", (_, res) => {
  setTimeout(() => {
    res.send({ counter });
  }, 500);
});

app.get("/api/counter/increment", (_, res) => {
  counter++;
  setTimeout(() => {
    res.send({ counter });
  }, 500);
});

// use vite-express to serve the Vite app
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
