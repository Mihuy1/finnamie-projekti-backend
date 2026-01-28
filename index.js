import express from "express";
import cors from "cors";
import "dotenv/config";
import router from "./src/index.js";
import cookieParser from "cookie-parser";

const app = express();

// Kommenttiin testaamisen vuoksi.
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   }),
// );

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
