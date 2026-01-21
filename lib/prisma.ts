import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbServer = process.env.SQL_SERVER;
  const dbUser = process.env.SQL_USER;
  const dbPassword = process.env.SQL_PASSWORD;
  const dbName = process.env.SQL_DATABASE;

  if (!dbServer || !dbUser || !dbPassword || !dbName) {
    throw new Error(
      "Database environment variables are not set. Required: SQL_SERVER, SQL_USER, SQL_PASSWORD, SQL_DATABASE"
    );
  }

  // Use config object approach for better Azure SQL compatibility
  // This provides more reliable connection handling and clearer timeout settings
  const adapter = new PrismaMssql({
    server: dbServer,
    port: 1433,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    options: {
      encrypt: true, // Required for Azure SQL Database
      trustServerCertificate: false, // Verify certificate (more secure)
      connectTimeout: 10000, // 10 seconds - increased for Azure network latency
      requestTimeout: 30000, // 30 seconds - timeout for individual queries
      enableArithAbort: true, // Recommended for SQL Server
    },
    pool: {
      max: 10, // Maximum pool size
      min: 0, // Minimum pool size
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    },
  });
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy initialization: only create client when accessed, not at module load
// This allows the build to complete without database environment variables
// Using a getter ensures initialization only happens when prisma is actually used
let prismaInstance: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      prismaInstance = getPrismaClient();
    }
    return (prismaInstance as any)[prop];
  },
});