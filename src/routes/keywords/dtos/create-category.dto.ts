import { z } from "zod";

export const CreateCategoryKeywordDto = z.object({
  keyword: z.string().min(1, "Title is required"),
  categoryId: z.string().cuid("Category ID must be a valid CUID"),
});

export type CreateCategoryKeywordDtoType = z.infer<
  typeof CreateCategoryKeywordDto
>;
