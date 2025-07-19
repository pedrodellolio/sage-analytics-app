import { z } from "zod";

export const TransactionTypeEnum = z.enum(["EXPENSE", "INCOME"]);

export const CreateCategoryDto = z.object({
  title: z.string().min(1, "Title is required"),
  colorHex: z.string(),
});

export type CreateCategoryDtoType = z.infer<typeof CreateCategoryDto>;
