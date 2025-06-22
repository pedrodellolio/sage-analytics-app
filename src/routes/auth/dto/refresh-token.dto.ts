import { z } from "zod";

export const RefreshTokenDto = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenDtoType = z.infer<typeof RefreshTokenDto>;
