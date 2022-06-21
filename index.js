import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./database/config.js";
import authRouter from "./routes/auth.route.js";
const app = express();

dotenv.config();
app.use(express.json());
app.use("/auth", authRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log("😍😍 http://localhost:" + PORT));
