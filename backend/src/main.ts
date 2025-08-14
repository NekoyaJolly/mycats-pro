import { ValidationPipe, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  try {
    logger.log("Starting Cat Management System API...");

    const app = await NestFactory.create(AppModule, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? ["https://yourdomain.com"]
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

    // Health check endpoint
    app.getHttpAdapter().get("/health", (req, res) => {
      res.json({
        success: true,
        data: {
          status: "ok",
          timestamp: new Date().toISOString(),
          service: "Cat Management System API",
          version: "1.0.0",
        },
      });
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
