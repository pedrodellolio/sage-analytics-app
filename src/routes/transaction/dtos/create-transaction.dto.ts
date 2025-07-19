import { z } from "zod";
import { TransactionType } from "../../../../generated/prisma";

export const TransactionTypeEnum = z.enum(["EXPENSE", "INCOME"]);

export const CreateTransactionDto = z.object({
  title: z.string().min(1, "Title is required"),
  valueBrl: z.number().positive("Value must be greater than 0"),
  type: z.nativeEnum(TransactionType).default("EXPENSE"),
  occurredAt: z.coerce.date(),
  categoryId: z.string().cuid("Category ID must be a valid CUID").optional(),
});

export type CreateTransactionDtoType = z.infer<typeof CreateTransactionDto>;
