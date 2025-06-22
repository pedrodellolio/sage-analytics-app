import { Application, Router } from "express";
import transactionRouter from "./transaction/transaction.controller";
import passport from "passport";
import authRouter from "./auth/auth.controller";
import userRouter from "./user/user.controller";

export const configureRouting = (app: Application) => {
  const router = Router();
  app.use("/api", router);
  router.use("/auth", authRouter);
  router.use(
    "/transaction",
    passport.authenticate("jwt", { session: false }),
    transactionRouter
  );
  router.use(
    "/user",
    passport.authenticate("jwt", { session: false }),
    userRouter
  );
};
