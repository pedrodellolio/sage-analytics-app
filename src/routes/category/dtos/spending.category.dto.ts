import { z } from "zod";

export const SpendingCategoryDto = z.object({
  title: z.string().min(1, "Title is required"),
  colorHex: z.string(),
  valueBrl: z.number(),
  percentage: z.number(),
});

export type SpendingCategoryDtoType = z.infer<typeof SpendingCategoryDto>;
