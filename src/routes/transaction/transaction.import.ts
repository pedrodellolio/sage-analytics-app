import { NextFunction, Request, Response } from "express";
import csv from "csv-parser";
import { Readable } from "stream";
import { processTransactions } from "./transaction.service";
import { CreateTransactionDtoType } from "./dtos/create-transaction.dto";
import { Bank, bankParsers } from "./enums/banks.enum";

export const importTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: "At least one CSV file is required" });
    return;
  }

  if (files.length > 12) {
    res.status(400).json({ error: "Maximum of 12 files exceeded" });
    return;
  }

  const bank = req.body.bank as Bank;
  const parser = bankParsers[bank];
  if (!parser) {
    res.status(400).send({ error: "Unsupported bank" });
    return;
  }

  const transactions: CreateTransactionDtoType[] = [];

  try {
    for (const file of files) {
      await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(file.buffer);
        stream
          .pipe(csv())
          .on("data", (row: Record<string, string>) => {
            const parsed = parser(row);
            transactions.push(parsed);
          })
          .on("end", resolve)
          .on("error", reject);
      });
    }

    // TO-DO: group by walletKey to improve insert performance
    const result = await processTransactions(transactions, user.id);
    res.status(201).json({ imported: result.length });
  } catch (error) {
    next(error);
  }
};
