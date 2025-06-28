import { z } from "zod";

export const NubankTransactionDto = z.object({
  title: z.string(),
  amount: z.string().transform((v) => parseFloat(v)),
  date: z.string().transform((v) => new Date(v)),
});

export type NubankTransactionDtoType = z.infer<typeof NubankTransactionDto>;
