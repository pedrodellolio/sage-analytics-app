import { detectCategoryByKeyword } from "../../category/category.service";
import {
  CreateTransactionDto,
  CreateTransactionDtoType,
} from "../dtos/create-transaction.dto";
import {
  NubankCheckingAccountTransactionDto,
  NubankCreditCardTransactionDto,
} from "../dtos/nubank-transaction.dto";

type ParsedNubankRow = {
  title: string;
  date: Date;
  amount: number;
};

const TRANSACTIONS_TO_IGNORE = ["Pagamento recebido"];

export async function parseNubankTransactionRow(
  row: Record<string, string>,
  userId: string
): Promise<CreateTransactionDtoType | undefined> {
  const parsed = parseCommonNubankRow(row);

  if (TRANSACTIONS_TO_IGNORE.includes(parsed.title.trim())) return;

  const category = await detectCategoryByKeyword(parsed.title, userId);
  const mappedTransaction: CreateTransactionDtoType = {
    title: parsed.title,
    occurredAt: parsed.date,
    valueBrl: Math.abs(parsed.amount),
    type: "EXPENSE",
    categoryId: category?.id,
  };

  const newTransaction = CreateTransactionDto.safeParse(mappedTransaction);

  if (!newTransaction.success) {
    throw new Error(
      `Invalid transaction: ${JSON.stringify(newTransaction.error.issues)}`
    );
  }

  return newTransaction.data;
}

function parseCommonNubankRow(row: Record<string, string>): ParsedNubankRow {
  const creditCardResult = NubankCreditCardTransactionDto.safeParse(row);

  if (creditCardResult.success) {
    const { title, date, amount } = creditCardResult.data;
    return { title, date, amount };
  }

  const checkingAccountResult =
    NubankCheckingAccountTransactionDto.safeParse(row);

  if (checkingAccountResult.success) {
    const { descricao, data, valor } = checkingAccountResult.data;
    return { title: descricao, date: data, amount: valor };
  }

  throw new Error(
    `Invalid row:\nCredit Card Errors: ${JSON.stringify(
      creditCardResult.error.issues
    )}\nChecking Account Errors: ${JSON.stringify(
      checkingAccountResult.error.issues
    )}`
  );
}
