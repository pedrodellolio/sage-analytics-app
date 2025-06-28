import { NextFunction, Request, Response } from "express";
import csv from "csv-parser";
import { Readable } from "stream";
import { parseNubankTransactionRow } from "./transaction.parser";
import { processTransactions } from "./transaction.service";
import { CreateTransactionWithWalletKey } from "./dto/create-transaction.dto";

export const importTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user; // injected by Passport after authentication
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "CSV file is required" });
    return;
  }

  const transactions: CreateTransactionWithWalletKey[] = [];
  const walletMap = new Map<
    string,
    { userId: string; month: number; year: number }
  >();

  const stream = Readable.from(file.buffer);
  stream
    .pipe(csv())
    .on("data", (row: any) => {
      const parsed = parseNubankTransactionRow(row);
      const occurredAt = new Date(parsed.date);
      const walletKey = `${user.id}-${occurredAt.getFullYear()}-${
        occurredAt.getMonth() + 1
      }`;

      if (!walletMap.has(walletKey)) {
        walletMap.set(walletKey, {
          userId: user.id,
          month: occurredAt.getMonth() + 1,
          year: occurredAt.getFullYear(),
        });
      }

      transactions.push({
        title: parsed.title,
        valueBrl: parsed.amount,
        type: parsed.amount > 0 ? "INCOME" : "EXPENSE",
        occurredAt,
        walletKey,
      });
    })
    .on("end", async () => {
      try {
        //TO-DO: group by walletKey to improve insert performance
        const result = await processTransactions(transactions, user.id);
        res.status(201).json({ imported: result.length });
      } catch (error) {
        next(error);
      }
    })
    .on("error", next);
};
