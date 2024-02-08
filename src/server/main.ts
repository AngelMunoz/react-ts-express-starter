import express from "express";
import ViteExpress from "vite-express";
import { initializeDatabase, Todo } from "./database.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const database = await initializeDatabase();

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

// todos sample routes

app.get("/api/todos", async (req, res) => {
  const page = parseInt(req.query?.page as string) ?? 1;
  const limit = parseInt(req.query?.limit as string) ?? 10;
  const todos = await Todo.findAndCountAll({
    offset: (page - 1) * limit,
    limit,
  });
  res.send(todos);
});

app.post("/api/todos", async (req, res) => {
  let todo = await Todo.create(req.body);

  const count = await Todo.count();

  res.send({ todo, count }).status(201);
});

app.put("/api/todos/:id", async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  await todo?.update(req.body);
  const count = await Todo.count();
  res.send({ todo, count });
});

app.delete("/api/todos/:id", async (req, res) => {
  const todo = await Todo.findByPk(req.params.id);
  await todo?.destroy();
  const count = await Todo.count();
  res.send({ todo, count });
});

// use vite-express to serve the Vite app
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
