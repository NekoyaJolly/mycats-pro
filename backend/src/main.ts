import { existsSync, statSync } from 'fs';
import { resolve } from 'path';

import { ValidationPipe, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import cookieParser from 'cookie-parser';
import { config as loadEnv } from 'dotenv';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';


import { AppModule } from "./app.module";
import { validateProductionEnvironment, logEnvironmentInfo } from "./common/environment.validation";
import { EnhancedGlobalExceptionFilter } from "./common/filters/enhanced-global-exception.filter";
import { PerformanceMonitoringInterceptor } from "./common/interceptors/performance-monitoring.interceptor";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";

const candidateEnvFiles: Array<{ file: string; override: boolean }> = [
  { file: resolve(__dirname, "..", ".env"), override: false },
  { file: resolve(__dirname, "..", ".env.example"), override: false },
  { file: resolve(__dirname, "..", ".env.local"), override: true },
];

for (const candidate of candidateEnvFiles) {
  if (existsSync(candidate.file) && statSync(candidate.file).size > 0) {
    loadEnv({ path: candidate.file, override: candidate.override });
  }
}

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  try {
    logger.log("Starting Cat Management System API...");

    // Validate environment configuration
    if (process.env.NODE_ENV === "production") {
      validateProductionEnvironment();
      logger.log("✅ Production environment validation passed");
    }
    
    logEnvironmentInfo();

    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.CORS_ORIGIN?.split(",") || ["https://yourdomain.com"]
            : [
                "http://localhost:3000",
                "http://localhost:3002",
                "http://localhost:3003",
                "http://localhost:3005",
              ],
        credentials: true,
      },
    });

  // Pino logger
  app.useLogger(app.get(PinoLogger));

    // Security: Helmet middleware for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      noSniff: true,
      xssFilter: true,
    }),
  );

  // Sentry (条件付き)
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
      profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE || 0.1),
      integrations: [nodeProfilingIntegration()],
    });
    logger.log('Sentry initialized');
  }

  // Cookie parser (for refresh token, etc.)
  app.use(cookieParser());

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );    // Global response interceptor
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    // Performance monitoring interceptor
    app.useGlobalInterceptors(new PerformanceMonitoringInterceptor());

    // Global exception filter (enhanced version)
    app.useGlobalFilters(new EnhancedGlobalExceptionFilter());

    // API prefix
    app.setGlobalPrefix("api/v1");

    // Root endpoint
    app.getHttpAdapter().get("/", (req: unknown, res: { json: (data: unknown) => void }) => {
      res.json({
        success: true,
        data: {
          message: "🐱 Cat Management System API",
          version: "1.0.0",
          documentation: "/api/docs",
          health: "/health",
          timestamp: new Date().toISOString(),
          endpoints: {
            cats: "/api/v1/cats",
            pedigrees: "/api/v1/pedigrees",
            breeds: "/api/v1/breeds",
            coatColors: "/api/v1/coat-colors",
          },
        },
      });
    });

    // Enhanced health check endpoint
    app.getHttpAdapter().get("/health", async (req: unknown, res: { status: (code: number) => { json: (data: unknown) => void } }) => {
      const health: {
        success: boolean;
        data: {
          status: string;
          timestamp: string;
          service: string;
          version: string;
          environment?: string;
          uptime: number;
          memory: {
            used: number;
            total: number;
          };
          database?: string;
          error?: string;
        };
      } = {
        success: true,
        data: {
          status: "ok",
          timestamp: new Date().toISOString(),
          service: "Cat Management System API",
          version: "1.0.0",
          environment: process.env.NODE_ENV,
          uptime: process.uptime(),
          memory: {
            used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
            total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
          },
        },
      };

      try {
        // Database health check (if enabled)
        if (process.env.HEALTH_CHECK_DATABASE === "true") {
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          await prisma.$queryRaw`SELECT 1`;
          await prisma.$disconnect();
          health.data.database = "ok";
        }
      } catch (error) {
        health.success = false;
        health.data.status = "error";
        health.data.database = "error";
        health.data.error = error instanceof Error ? error.message : "Unknown error";
      }

      res.status(health.success ? 200 : 503).json(health);
    });    // Swagger documentation
    if (process.env.NODE_ENV !== "production") {
      const config = new DocumentBuilder()
        .setTitle("Cat Management System API")
        .setDescription("API for managing cat breeding and care records")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup("api/docs", app, document);
    }

  const port = process.env.PORT || 3004;
    await app.listen(port);

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.log(`🚨 Received ${signal}. Starting graceful shutdown...`);
      app.close().then(() => {
        logger.log("✅ Application closed successfully");
        process.exit(0);
      }).catch((error) => {
        logger.error("❌ Error during shutdown:", error);
        process.exit(1);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`❤️  Health Check: http://localhost:${port}/health`);
  } catch (error) {
    logger.error("Failed to start application:", error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error("Unhandled error during bootstrap:", error);
  process.exit(1);
});
