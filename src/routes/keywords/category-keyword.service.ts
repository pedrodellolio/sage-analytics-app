import prisma from "../../libs/prisma";

/**
 * Creates one label
 */
export const postCategoryKeyword = async (
  keyword: string,
  categoryId: string,
  userId: string
) => {
  const category = await prisma.label.findFirst({
    where: {
      id: categoryId,
      userId: userId,
    },
  });

  if (!category) {
    throw new Error("Category not found or does not belong to the user");
  }

  await prisma.labelKeywords.upsert({
    where: { keyword },
    update: { labelId: categoryId },
    create: { keyword, labelId: categoryId },
  });
};
