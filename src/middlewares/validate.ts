import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(
  schema: ZodSchema,
  target: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[target]);
      (req as any).validated = {
        ...(req as any).validated,
        [target]: result,
      };
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: err.errors });
        return;
      }

      next(err);
    }
  };
}
