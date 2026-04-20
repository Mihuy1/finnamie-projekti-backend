import express from "express";
import cors from "cors";
import "dotenv/config";
import router from "./src/index.js";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { createSocket } from "./socket.js";
import { webhookRouter } from "./src/routes/webhook-router.js";

const app = express();
const server = createServer(app);
createSocket(server);

app.use(
  cors({
    origin: "http://localhost:5173", // urli .env:istä?
    credentials: true,
  }),
);
app.use("/webhook", webhookRouter); // tämän pitää olla ennen express.json(), koska Stripe haluaa webhookin req.bodyn Bufferina
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", router);
app.use("/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT ?? 3000;

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
