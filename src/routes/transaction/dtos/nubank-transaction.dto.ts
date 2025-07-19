import { z } from "zod";

export const NubankCreditCardTransactionDto = z.object({
  title: z.string(),
  amount: z.string().transform((v) => parseFloat(v)),
  date: z.string().transform((v) => new Date(v)),
});

export const NubankCheckingAccountTransactionDto = z.object({
  descricao: z.string(),
  valor: z.string().transform((v) => parseFloat(v)),
  data: z.string().transform((v) => new Date(v)),
});

export type NubankCreditCardTransactionDtoType = z.infer<
  typeof NubankCreditCardTransactionDto
>;
export type NubankCheckingAccountTransactionDtoType = z.infer<
  typeof NubankCheckingAccountTransactionDto
>;
