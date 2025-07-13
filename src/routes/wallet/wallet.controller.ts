import { Router, Request, Response, NextFunction } from "express";
import z from "zod";
import { validate } from "../../middlewares/validate";
import { getWalletByPeriod, getWalletsByYear } from "./wallet.service";

const walletRouter = Router();

const querySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/)
    .transform(Number)
    .refine((y) => y >= 1900 && y <= 3000, {
      message: "Year must be between 1900 and 3000",
    }),
});

/**
 * Get user's wallets
 * @auth required
 * @route {GET} /wallet
 */
walletRouter.get(
  "/",
  validate(querySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { year } = (req as any).validated.query as { year: number };

      const wallets = await getWalletsByYear(user.id, year);
      res.status(200).json(wallets);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Get user's wallets
 * @auth required
 * @route {GET} /wallet
 */
walletRouter.get(
  "/getByPeriod",
  validate(querySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { month, year } = (req as any).validated.query as {
        month: number;
        year: number;
      };

      const wallet = await getWalletByPeriod({ month, year, userId: user.id });
      res.status(200).json(wallet);
    } catch (err) {
      next(err);
    }
  }
);

export default walletRouter;
