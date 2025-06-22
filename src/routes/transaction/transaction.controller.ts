import { Router, Request, Response, NextFunction } from "express";

const transactionRouter = Router();

/**
 * Get all user's transactions
 * @auth required
 * @route {POST} /transactions
 * @bodyparam transaction Transaction
 * @returns transaction Transaction
 */
transactionRouter.get("/profile", async (req: Request, res: Response) => {
  // req.user é injetado pelo Passport depois da autenticação
  const user = (req as any).user;
});
export default transactionRouter;
