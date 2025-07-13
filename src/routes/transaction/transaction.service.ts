import { TransactionType } from "../../../generated/prisma";
import prisma from "../../libs/prisma";
import { ensureWallet } from "../wallet/wallet.service";
import { CreateTransactionDtoType } from "./dtos/create-transaction.dto";

/**
 * Returns all user's transactions
 */
export const getTransactions = async (userId: string) => {
  try {
    return await prisma.transaction.findMany({
      where: { wallet: { userId } },
      orderBy: { occurredAt: "desc" },
    });
  } catch (error) {
    console.error("[getTransactions] Error:", error);
    throw new Error("Could not fetch Transactions");
  }
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
    for (const t of transactions) {
      const ch = t as any; // ensure correct shape
      const txn = await _createOneTransaction({
        ...ch,
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
    },
  });

  const updateField = type === "INCOME" ? "incomeBrl" : "expensesBrl";
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { [updateField]: { increment: valueBrl } },
  });

  return transaction;
};

//TO-DO: group by walletKey to improve insert performance
// export const processTransactions = async (
//   transactions: CreateTransactionWithWalletKey[],
//   userId: string
// ) => {
//   try {
//     // Create wallets if they don't exist
//     const walletMap = new Map<
//       string,
//       { userId: string; month: number; year: number }
//     >();
//     transactions.forEach((txn) => {
//       const key = `${userId}-${txn.occurredAt.getFullYear()}-${
//         txn.occurredAt.getMonth() + 1
//       }`;
//       if (!walletMap.has(key)) {
//         walletMap.set(key, {
//           userId: userId,
//           month: txn.occurredAt.getMonth() + 1,
//           year: txn.occurredAt.getFullYear(),
//         });
//       }
//     });

//     await postWalletsByMap(walletMap);

//     // Map wallet keys to wallet IDs
//     const walletIdMap = new Map<string, string>();
//     const wallets = await prisma.wallet.findMany({
//       where: {
//         OR: Array.from(walletMap.values()).map((w) => ({
//           userId: w.userId,
//           month: w.month,
//           year: w.year,
//         })),
//       },
//       select: { id: true, userId: true, month: true, year: true },
//     });

//     wallets.forEach((w) => {
//       const key = `${w.userId}-${w.year}-${w.month}`;
//       walletIdMap.set(key, w.id);
//     });

//     const transactionData = transactions.map((txn) => ({
//       title: txn.title,
//       valueBrl: txn.valueBrl,
//       type: txn.type,
//       occurredAt: txn.occurredAt,
//       walletId: walletIdMap.get(txn.walletKey)!,
//     }));

//     // Bulk insert transactions
//     await prisma.transaction.createMany({
//       data: transactionData,
//     });

//     // Update wallet totals
//     await prisma.$transaction(
//       wallets.map((wallet) => {
//         const walletTransactions = transactionData.filter(
//           (txn) => txn.walletId === wallet.id
//         );
//         const income = walletTransactions
//           .filter((txn) => txn.type === "INCOME")
//           .reduce((sum, txn) => sum + txn.valueBrl, 0);
//         const expenses = walletTransactions
//           .filter((txn) => txn.type === "EXPENSE")
//           .reduce((sum, txn) => sum + txn.valueBrl, 0);

//         return prisma.wallet.update({
//           where: { id: wallet.id },
//           data: {
//             incomeBrl: income,
//             expensesBrl: expenses,
//           },
//         });
//       })
//     );

//     return { imported: transactionData.length };
//   } catch (error) {
//     console.error("");
//     throw new Error("");
//   }
// };
