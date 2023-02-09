"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
const port = 3000;
server.get("/", (req, res) => {
    //   console.log(req);
    console.log("received get command ");
    res.send("Hello World!");
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
