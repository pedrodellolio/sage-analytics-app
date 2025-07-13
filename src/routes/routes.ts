import { Application, Router } from "express";
import transactionRouter from "./transaction/transaction.controller";
import passport from "passport";
import authRouter from "./auth/auth.controller";
import userRouter from "./user/user.controller";
import walletRouter from "./wallet/wallet.controller";

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
    "/wallet",
    passport.authenticate("jwt", { session: false }),
    walletRouter
  );
  router.use(
    "/user",
    passport.authenticate("jwt", { session: false }),
    userRouter
  );
};
