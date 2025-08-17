import { Label, TransactionType } from "../../../generated/prisma";
import prisma from "../../libs/prisma";
import { SpendingCategoryDtoType } from "./dtos/spending.category.dto";

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
 * Returns all user's labels with total distribution (percentage/BRL)
 */
export const getSpendingCategoryDistribution = async (
  userId: string,
  month: number,
  year: number
) => {
  try {
    const result = (await prisma.$queryRaw`
SELECT
  l."title",
  l."colorHex",
  COALESCE(SUM(t."valueBrl"), 0) AS "valueBrl",
  COALESCE(ROUND(100.0 * SUM(t."valueBrl") / SUM(SUM(t."valueBrl")) OVER (), 2), 0) as "percentage"
FROM
  public."Label" l
INNER JOIN
  public."Transaction" t
  ON t."labelId" = l."id"
  AND EXTRACT(YEAR FROM t."occurredAt") = ${year}
  AND EXTRACT(MONTH FROM t."occurredAt") = ${month}
  AND l."userId" = ${userId}
GROUP BY
  l."id", l."title", l."colorHex"
ORDER BY
  "valueBrl" DESC
LIMIT 10;`) as SpendingCategoryDtoType[];

    return result;
  } catch (error) {
    console.error("[getLabels] Error:", error);
    throw new Error("Could not fetch Labels");
  }
};

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
