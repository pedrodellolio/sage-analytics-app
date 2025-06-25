import { TransactionType } from "../../../generated/prisma";
import prisma from "../../libs/prisma";
import { getWalletByPeriod, postWallet } from "../wallet/wallet.service";

export const getTransactions = async (userId: string) => {
  try {
    return await prisma.transaction.findMany({
      where: { wallet: { userId } },
      orderBy: { occurredAt: "desc" },
    });
  } catch (error) {
    console.error("[getArticles] Error:", error);
    throw new Error("Could not fetch articles");
  }
};

export const postTransactions = async ({
  title,
  valueBrl,
  type,
  occurredAt,
  userId,
}: {
  title: string;
  valueBrl: number;
  type: TransactionType;
  occurredAt: Date;
  userId: string;
}) => {
  try {
    const month = occurredAt.getMonth() + 1;
    const year = occurredAt.getFullYear();

    const walletQuery = {
      userId,
      month,
      year,
    };

    return await prisma.$transaction(async (tx) => {
      // Find wallet
      let wallet = await getWalletByPeriod(walletQuery);

      // If wallet doesn't exist, create one
      if (!wallet) wallet = await postWallet(walletQuery);

      // Create the transaction associated to the wallet
      const transaction = await tx.transaction.create({
        data: {
          title,
          valueBrl,
          type,
          occurredAt,
          walletId: wallet.id,
        },
      });

      // Update wallet's totals
      const updateField = type === "INCOME" ? "incomeBrl" : "expensesBrl";

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          [updateField]: {
            increment: valueBrl,
          },
        },
      });

      return transaction;
    });
  } catch (error) {
    console.error("[postTransactions] Error:", error);
    throw new Error("Could not create Transaction");
  }
};
