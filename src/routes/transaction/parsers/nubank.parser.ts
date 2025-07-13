import { z } from "zod";
import {
  CreateTransactionDto,
  CreateTransactionDtoType,
} from "../dtos/create-transaction.dto";

const NubankTransactionDto = z.object({
  title: z.string(),
  amount: z.string().transform((v) => parseFloat(v)),
  date: z.string().transform((v) => new Date(v)),
});

export function parseNubankTransactionRow(
  row: Record<string, string>
): CreateTransactionDtoType {
  const result = NubankTransactionDto.safeParse(row);

  if (!result.success)
    throw new Error(`Invalid row: ${JSON.stringify(result.error.issues)}`);

  const mappedTransaction: CreateTransactionDtoType = {
    title: result.data.title,
    occurredAt: result.data.date,
    valueBrl: Math.abs(result.data.amount),
    type: "EXPENSE",
  };

  const newTransaction = CreateTransactionDto.safeParse(mappedTransaction);

  if (!newTransaction.success)
    throw new Error(
      `Invalid transaction: ${JSON.stringify(newTransaction.error.issues)}`
    );

  return newTransaction.data;
}
