import { Wallet } from "../../../generated/prisma";
import prisma from "../../libs/prisma";

/**
 * Returns all user's transactions
 */
export const getWalletsByYear = async (userId: string, year: number) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId, year },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return wallets.map((w) => _safeConvertFromPrisma(w));
  } catch (error) {
    console.error("[getWallets] Error:", error);
    throw new Error("Could not fetch Wallets");
  }
};

/**
 * Returns a wallet for the given period
 */
export const getWalletByPeriod = async ({
  month,
  year,
  userId,
}: {
  month: number;
  year: number;
  userId: string;
}) => {
  try {
    const wallet = await prisma.wallet.findFirst({
      where: { userId, month, year },
    });

    return _safeConvertFromPrisma(wallet);
  } catch (error) {
    console.error("[getWalletByPeriod] Error:", error);
    throw new Error("Could not fetch Wallet");
  }
};

/**
 * Creates a wallet
 */
export const postWallet = async ({
  month,
  year,
  userId,
}: {
  month: number;
  year: number;
  userId: string;
}) => {
  try {
    return prisma.wallet.create({
      data: {
        month,
        year,
        userId,
      },
    });
  } catch (error) {
    console.error("[postWallet] Error:", error);
    throw new Error("Could not create Wallet");
  }
};

export const postWalletsByMap = async (
  map: Map<string, { userId: string; month: number; year: number }>
) => {
  await prisma.wallet.createMany({
    data: Array.from(map.values()),
    skipDuplicates: true,
  });
};

/**
 * Ensures a wallet exists for the given period
 */
export const ensureWallet = async (userId: string, occurredAt: Date) => {
  const month = occurredAt.getMonth() + 1;
  const year = occurredAt.getFullYear();
  const where = { userId, month, year };

  let wallet = await prisma.wallet.findFirst({ where });
  if (!wallet) wallet = await prisma.wallet.create({ data: where });
  return wallet;
};

const _safeConvertFromPrisma = (wallet: Wallet | null) => {
  if (!wallet) return null;
  return {
    ...wallet,
    incomeBrl: Number(wallet.incomeBrl),
    expensesBrl: Number(wallet.expensesBrl),
  };
};
