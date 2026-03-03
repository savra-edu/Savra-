import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please set it in your Render environment variables.'
  );
}

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;
// Use WebSocket for queries (more reliable for long-running connections)
neonConfig.poolQueryViaFetch = false;
neonConfig.useSecureWebSocket = true;
// Increase WebSocket timeout
neonConfig.wsProxy = (host) => host;
neonConfig.pipelineConnect = false;

const connectionString = process.env.DATABASE_URL;

// Validate connection string format
if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
  throw new Error(
    'DATABASE_URL must start with postgresql:// or postgres://. Please check your connection string in Render environment variables.'
  );
}

// Create connection pool with generous timeouts
const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 120000, // 2 minute timeout
  idleTimeoutMillis: 300000, // 5 minute idle timeout
  max: 3, // Reduce pool size
});

// Create Prisma adapter
const adapter = new PrismaNeon(pool);

// Global type for Prisma client singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Create Prisma client with Neon adapter
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Retry helper for database operations that may fail due to cold starts
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 2000
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const errorMessage = lastError.message || '';
      const isRetryable =
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('Connection terminated') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('CONNECT_TIMEOUT') ||
        errorMessage.includes("Can't reach database") ||
        errorMessage.includes('Transaction not found') ||
        errorMessage.includes('P2028') ||
        (lastError as any)?.code === 'P2028';

      if (isRetryable && attempt < maxRetries) {
        console.log(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 1.5; // Gentler backoff
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

export default prisma;
