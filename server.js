const express = require("express");
const http = require("http");
const ejs = require("ejs");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.get("/", (req, res, next) => res.render("index"));

const peerServer = ExpressPeerServer(server, {
  path: "/peer",
  debug: true,
});

app.use(peerServer);

peerServer.on("connection", (client) => {
  console.log("peer connected successfully");
});

server.listen(4000);
