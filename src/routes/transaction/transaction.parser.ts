import { NubankTransactionDto } from "./dto/import-transaction-dto";

export function parseNubankTransactionRow(row: Record<string, string>) {
  const result = NubankTransactionDto.safeParse(row);

  if (!result.success) {
    throw new Error(`Invalid row: ${JSON.stringify(result.error.issues)}`);
  }

  return result.data;
}
