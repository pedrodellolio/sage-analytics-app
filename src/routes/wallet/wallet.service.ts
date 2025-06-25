import prisma from "../../libs/prisma";

export const getWallets = async (userId: string) => {
  try {
    return await prisma.wallet.findMany({
      where: { userId },
      orderBy: { month: "desc", year: "desc" },
    });
  } catch (error) {
    console.error("[getWallets] Error:", error);
    throw new Error("Could not fetch Wallets");
  }
};

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
    return await prisma.wallet.findFirst({ where: { userId, month, year } });
  } catch (error) {
    console.error("[getWalletByPeriod] Error:", error);
    throw new Error("Could not fetch Wallet");
  }
};

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
