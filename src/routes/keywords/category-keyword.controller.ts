import { Router, Request, Response, NextFunction } from "express";
import { CreateCategoryKeywordDto } from "./dtos/create-category.dto";
import { postCategoryKeyword } from "./category-keyword.service";

const categoryKeywordRouter = Router();

/**
 * Creates user's category keyword
 * @auth required
 * @route {POST} /category
 */
categoryKeywordRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    const parseResult = CreateCategoryKeywordDto.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const label = await postCategoryKeyword(
        parseResult.data.keyword,
        parseResult.data.categoryId,
        user.id
      );
      res.status(201).json(label);
    } catch (err) {
      console.error("Error:", err);
      next(err);
    }
  }
);

export default categoryKeywordRouter;
