import cron from 'node-cron';
import prisma from './prisma';

/**
 * Database keepalive cron job
 * Runs at configurable intervals to keep Neon database and backend active
 * Reads interval from KEEPALIVE_INTERVAL_MINUTES environment variable (defaults to 5 minutes)
 */
export function startKeepAliveCron(): void {
  // Read interval from environment variable, default to 5 minutes
  let intervalMinutes = parseInt(process.env.KEEPALIVE_INTERVAL_MINUTES || '5', 10);

  // Validate interval is a positive number
  if (isNaN(intervalMinutes) || intervalMinutes < 1) {
    console.warn(
      `Invalid KEEPALIVE_INTERVAL_MINUTES value: ${process.env.KEEPALIVE_INTERVAL_MINUTES}. Using default: 5 minutes`
    );
    intervalMinutes = 5;
  }

  // Convert minutes to cron expression: */N * * * * means every N minutes
  const cronExpression = `*/${intervalMinutes} * * * *`;

  // Schedule the cron job
  cron.schedule(cronExpression, async () => {
    try {
      // Simple query to wake up the database
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[${new Date().toISOString()}] Database keepalive ping successful`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database keepalive ping failed:`, error);
    }
  });

  console.log(
    `✅ Database keepalive cron job started (runs every ${intervalMinutes} minute${intervalMinutes !== 1 ? 's' : ''})`
  );
}
