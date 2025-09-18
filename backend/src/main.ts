import { ValidationPipe, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";
import { validateProductionEnvironment, logEnvironmentInfo } from "./common/environment.validation";

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

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global response interceptor
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // API prefix
    app.setGlobalPrefix("api/v1");

    // Root endpoint
    app.getHttpAdapter().get("/", (req, res) => {
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
    app.getHttpAdapter().get("/health", async (req, res) => {
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
    });

    // Swagger documentation
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
