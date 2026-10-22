import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export const connectV2Database = async (): Promise<void> => {
    await prisma.$connect();
    console.log('PostgreSQL connected successfully');
};

export const disconnectV2Database = async (): Promise<void> => {
    await prisma.$disconnect();
};
