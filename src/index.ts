import express from "express";
import { configureRouting } from "./routes/routes";
import "./libs/passport";
import config from "./config/env";
import cookieParser from "cookie-parser";
import passport from "passport";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
configureRouting(app);

app.use((err: any, req: any, res: any, next: any) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno no servidor" });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${config.port}`);
});
