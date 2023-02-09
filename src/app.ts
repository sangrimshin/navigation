import express, { Request, Response, NextFunction } from "express";
import { fetchmap } from "./manager/network";
const server = express();
const port = 3000;

server.get("/", (req: Request, res: Response) => {
  //   console.log(req);
  console.log("received get command ");
  res.send("Hello JS World!");
  fetchmap(3);
});

server.get("/api/user/:id", (req, res) => {
  const { id } = req.params;
  //   console.log(req);
  console.log(req.params);
  console.log(id);
  res.json({ id });
});

server.post("/", (req, res) => {
  console.log(req);
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
