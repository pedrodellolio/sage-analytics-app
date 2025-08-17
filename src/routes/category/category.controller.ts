import { Router, Request, Response, NextFunction } from "express";
import {
  getLabels,
  getSpendingCategoryDistribution,
  postLabel,
  updateLabel,
} from "./category.service";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { validate } from "../../middlewares/validate";
import z from "zod";

const categoryRouter = Router();
const querySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/)
    .transform(Number)
    .refine((y) => y >= 1900 && y <= 3000, {
      message: "Year must be between 1900 and 3000",
    }),

  month: z
    .string()
    .regex(/^\d{1,2}$/)
    .transform(Number)
    .refine((m) => m >= 1 && m <= 12, {
      message: "Month must be between 1 and 12",
    }),
});

/**
 * Gets user's category
 * @auth required
 * @route {GET} /category
 */
categoryRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const labels = await getLabels(user.id);
      res.status(200).json(labels);
    } catch (err) {
      console.error("Error:", err);
      next(err);
    }
  }
);

/**
 * Gets user's spending category distribution (chart)
 * @auth required
 * @route {GET} /category/spendingCategoryDistribution
 */
categoryRouter.get(
  "/spendingCategoryDistribution",
  validate(querySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const { month, year } = (req as any).validated.query as {
        month: number;
        year: number;
      };

      const labels = await getSpendingCategoryDistribution(
        user.id,
        month,
        year
      );

      res.status(200).json(labels);
    } catch (err) {
      console.error("Error:", err);
      next(err);
    }
  }
);

/**
 * Creates user's category
 * @auth required
 * @route {POST} /category
 */
categoryRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    const parseResult = CreateCategoryDto.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const label = await postLabel(
        parseResult.data.title,
        parseResult.data.colorHex,
        user.id
      );
      res.status(201).json(label);
    } catch (err) {
      console.error("Error:", err);
      next(err);
    }
  }
);

/**
 * Updates user's category
 * @auth required
 * @route {POST} /category
 */
categoryRouter.put(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    const parseResult = CreateCategoryDto.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const label = await updateLabel(
        parseResult.data.title,
        parseResult.data.colorHex,
        user.id
      );
      res.status(201).json(label);
    } catch (err) {
      console.error("Error:", err);
      next(err);
    }
  }
);

export default categoryRouter;
