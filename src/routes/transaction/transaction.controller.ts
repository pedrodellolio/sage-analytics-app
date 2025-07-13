import { Router, Request, Response, NextFunction } from "express";
import { getTransactions, postTransaction } from "./transaction.service";
import { CreateTransactionDto } from "./dtos/create-transaction.dto";
import { importTransactions } from "./transaction.import";
import { upload } from "../../libs/multer";

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
      console.error("Error:", err);
      next(err);
    }
  }
);

/**
 * Create user's transaction
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
      const transactions = await postTransaction({
        ...parseResult.data,
        userId: user.id,
      });
      res.status(201).json(transactions);
    } catch (err) {
      console.error("Error:", err);
      next(err);
    }
  }
);

/**
 * Create transactions from CSV imported file
 * @auth required
 * @route {POST} /transaction
 */
transactionRouter.post("/import", upload.array("files"), importTransactions);

export default transactionRouter;
