import { Router, Request, Response, NextFunction } from "express";
import { getTransactions, postTransactions } from "./transaction.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

const transactionRouter = Router();

/**
 * Get user's transactions
 * @auth required
 * @route {GET} /transaction
 */
transactionRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user; // injected by Passport after authentication
      const transactions = await getTransactions(user.id);
      res.status(200).json(transactions);
    } catch (err) {
      console.error("Erro na rota protegida:", err);
      next(err);
    }
  }
);

/**
 * Get user's transactions
 * @auth required
 * @route {POST} /transaction
 */
transactionRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    const parseResult = CreateTransactionDto.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const transactions = await postTransactions({
        ...parseResult.data,
        userId: user.id,
      });
      res.status(201).json(transactions);
    } catch (err) {
      console.error("Erro na rota protegida:", err);
      next(err);
    }
  }
);

export default transactionRouter;
