import { PrismaClient } from '@prisma/client'; 
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// Create the database connection pool using node-postgres
const pool = new pg.Pool({
    connectionString: process.env.POSTGRES_DATABASE_URL,
    connectionTimeoutMillis: 5000, 
});

// Wrap it with the mandatory Prisma v7 Driver Adapter
const adapter = new PrismaPg(pool);

// Keep your global singleton logic for hot-reloading in development
const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

// Pass the adapter config into the constructor
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Update your connect wrappers
export const connectV2Database = async (): Promise<void> => {
    // In Prisma 7, $connect verifies the driver adapter can communicate with the DB
    await prisma.$connect();
    console.log('PostgreSQL connected successfully via Driver Adapter');
};

export const disconnectV2Database = async (): Promise<void> => {
    await prisma.$disconnect();
    await pool.end(); // Cleanly close the underlying pg pool as well
};
