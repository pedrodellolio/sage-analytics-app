import { PrismaClient } from "../../generated/prisma";
import config from "../config/env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (config.nodeEnv !== "production") globalForPrisma.prisma = prisma;

export default prisma;
