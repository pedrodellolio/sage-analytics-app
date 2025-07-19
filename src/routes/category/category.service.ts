import { Label, TransactionType } from "../../../generated/prisma";
import prisma from "../../libs/prisma";

export async function detectCategoryByKeyword(
  title: string,
  userId?: string
): Promise<Label | null> {
  const normalizedTitle = title.toLowerCase();

  const keywords = await prisma.labelKeywords.findMany({
    where: { label: { userId } },
    include: {
      label: true,
    },
  });

  for (const keyword of keywords) {
    if (normalizedTitle.includes(keyword.keyword.toLowerCase())) {
      return keyword.label;
    }
  }

  return null;
}

/**
 * Returns all user's labels
 */
export const getLabels = async (userId: string) => {
  try {
    return await prisma.label.findMany({
      where: { userId },
      orderBy: { title: "desc" },
    });
  } catch (error) {
    console.error("[getLabels] Error:", error);
    throw new Error("Could not fetch Labels");
  }
};

/**
 * Creates one label
 */
export const postLabel = async (
  title: string,
  colorHex: string,
  userId: string
) => {
  return prisma.label.create({
    data: { title, colorHex, userId },
  });
};

/**
 * Updates one label
 */
export const updateLabel = async (
  title: string,
  colorHex: string,
  userId: string
) => {
  return prisma.label.update({
    where: { title, userId },
    data: { title, colorHex },
  });
};
