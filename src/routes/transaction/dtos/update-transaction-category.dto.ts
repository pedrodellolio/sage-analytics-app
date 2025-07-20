import { z } from "zod";

export const UpdateTransactionCategoryDto = z.object({
  id: z.string().cuid("ID must be a valid CUID"),
  categoryId: z.string().cuid("Category ID must be a valid CUID"),
});

export type UpdateTransactionCategoryDtoType = z.infer<
  typeof UpdateTransactionCategoryDto
>;
