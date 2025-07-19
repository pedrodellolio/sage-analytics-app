import { Router, Request, Response, NextFunction } from "express";
import { getLabels, postLabel, updateLabel } from "./category.service";
import { CreateCategoryDto } from "./dtos/create-category.dto";

const categoryRouter = Router();

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
      const transactions = await getLabels(user.id);
      res.status(200).json(transactions);
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
