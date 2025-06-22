import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().nonempty(),
  JWT_SECRET_KEY: z.string().nonempty(),
  JWT_ISSUER: z.string().nonempty(),
  JWT_AUDIENCE: z.string().nonempty(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "🚨 Configuração inválida de variáveis de ambiente:",
    parsed.error.format()
  );
  process.exit(1);
}

const env = parsed.data;
export default {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  databaseUrl: env.DATABASE_URL,
  secretKey: env.JWT_SECRET_KEY,
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
};
