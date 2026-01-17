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

  // Construct SQL Server connection string
  // Format: sqlserver://SERVER:PORT;database=DATABASE;user=USER;password=PASSWORD;encrypt=true
  // For Azure SQL, server format is typically: SERVER.database.windows.net
  // Port 1433 is the standard SQL Server port
  const connectionString = `sqlserver://${dbServer}:1433;database=${dbName};user=${dbUser};password=${dbPassword};encrypt=true`;

  const adapter = new PrismaMssql(connectionString);
  
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