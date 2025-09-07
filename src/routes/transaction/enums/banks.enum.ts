import { CreateTransactionDtoType } from "../dtos/create-transaction.dto";
import { parseNubankTransactionRow } from "../parsers/nubank.parser";

export enum Bank {
  Nubank = "Nubank",
}

type ParserFn = (
  row: Record<string, string>,
  userId: string
) => Promise<CreateTransactionDtoType | undefined>;

export const bankParsers: Record<Bank, ParserFn> = {
  [Bank.Nubank]: parseNubankTransactionRow,
};
