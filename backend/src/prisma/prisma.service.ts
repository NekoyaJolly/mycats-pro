import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn'] 
        : ['query', 'info', 'warn', 'error'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    try {
      this.logger.log("Connecting to database...");
      await this.$connect();
      this.logger.log("✅ Successfully connected to database");
      
      // Test database connectivity
      await this.$queryRaw`SELECT 1`;
      this.logger.log("✅ Database health check passed");
      
    } catch (error) {
      this.logger.error("❌ Failed to connect to database:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log("🔌 Disconnecting from database...");
      await this.$disconnect();
      this.logger.log("🔌 Successfully disconnected from database");
    } catch (error) {
      this.logger.error("❌ Failed to disconnect from database:", error);
    }
  }

  // Health check method for monitoring
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // Connection count for monitoring
  async getConnectionCount(): Promise<number> {
    try {
      const result = await this.$queryRaw<[{ count: number }]>`
        SELECT count(*) as count FROM pg_stat_activity 
        WHERE state = 'active' AND application_name LIKE '%prisma%'
      `;
      return result[0]?.count || 0;
    } catch {
      return -1;
    }
  }
}
