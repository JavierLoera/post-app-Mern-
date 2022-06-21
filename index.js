import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./database/config.js";
import authRouter from "./routes/auth.route.js";
const app = express();

dotenv.config();
app.use(express.json());
app.use("/auth", authRouter);

app.post("/api/articles/:name/add-comments", (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  articlesInfo[articleName].comments.push({ username, text });
  res.status(200).send(articlesInfo);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log("😍😍 http://localhost:" + PORT));
