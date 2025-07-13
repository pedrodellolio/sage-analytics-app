import { z } from "zod";
import { TransactionType } from "../../../../generated/prisma";

export const TransactionTypeEnum = z.enum(["EXPENSE", "INCOME"]);

export const CreateTransactionDto = z.object({
  title: z.string().min(1, "Title is required"),
  valueBrl: z.number().positive("Value must be greater than 0"),
  type: z.nativeEnum(TransactionType).default("EXPENSE"),
  occurredAt: z.coerce.date(),
});

export type CreateTransactionWithWalletKey = CreateTransactionDtoType & {
  walletKey: string;
};
export type CreateTransactionDtoType = z.infer<typeof CreateTransactionDto>;
