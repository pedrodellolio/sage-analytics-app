import { Transaction, TransactionType } from "../../../generated/prisma";
import prisma from "../../libs/prisma";
import { postCategoryKeyword } from "../keywords/category-keyword.service";
import { ensureWallet } from "../wallet/wallet.service";
import { CreateTransactionDtoType } from "./dtos/create-transaction.dto";

/**
 * Returns all user's transactions
 */
export const getTransactions = async (userId: string, limit: number = 0) => {
  try {
    return await prisma.transaction.findMany({
      where: { wallet: { userId } },
      orderBy: { occurredAt: "desc" },
      include: { label: true },
      ...(limit > 0 && { take: limit }),
    });
  } catch (error) {
    console.error("[getTransactions] Error:", error);
    throw new Error("Could not fetch Transactions");
  }
};

/**
 * Updates one transaction's category
 */
export const updateTransactionCategory = async (
  transactionId: string,
  categoryId: string
) => {
  prisma.$transaction(async (tx) => {
    const transaction = await prisma.transaction.update({
      data: {
        labelId: categoryId,
      },
      where: {
        id: transactionId,
      },
      include: {
        label: true,
      },
    });

    if (transaction.label) {
      await postCategoryKeyword(
        transaction.title,
        transaction.label.id,
        transaction.label.userId
      );
    }
  });
};

/**
 * Creates one transactions
 */
export const postTransaction = async (params: {
  title: string;
  valueBrl: number;
  type: TransactionType;
  occurredAt: Date;
  userId: string;
}) => {
  return prisma.$transaction((tx) => _createOneTransaction(params));
};

/**
 * Creates many transactions
 */
export const processTransactions = async (
  transactions: CreateTransactionDtoType[],
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    const createdTxns = [];
    for (const transaction of transactions) {
      const txn = await _createOneTransaction({
        ...transaction,
        userId,
      });
      createdTxns.push(txn);
    }
    return createdTxns;
  });
};

/**
 * Creates one transaction and updates wallet totals
 */
const _createOneTransaction = async (params: {
  title: string;
  valueBrl: number;
  type: TransactionType;
  occurredAt: Date;
  categoryId?: string;
  userId: string;
}) => {
  const { title, valueBrl, type, occurredAt, userId } = params;
  const wallet = await ensureWallet(userId, occurredAt);

  const transaction = await prisma.transaction.create({
    data: {
      title,
      valueBrl,
      type,
      occurredAt,
      walletId: wallet.id,
      labelId: params.categoryId,
    },
  });

  const updateField = type === "INCOME" ? "incomeBrl" : "expensesBrl";
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { [updateField]: { increment: valueBrl } },
  });

  return transaction;
};
