import { z } from "zod";

export const RegisterDto = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterDtoType = z.infer<typeof RegisterDto>;
