/**
 * Production Environment Validation
 * Ensures all required environment variables are properly configured
 */

export interface ProductionConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGIN: string;
}

export function validateProductionEnvironment(): ProductionConfig {
  const errors: string[] = [];

  // Required variables
  const requiredVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  };

  // Check for missing variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });

  // Validate JWT secret length (should be at least 256 bits / 32 characters)
  if (requiredVars.JWT_SECRET && requiredVars.JWT_SECRET.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters long for security");
  }

  // Validate NODE_ENV
  if (requiredVars.NODE_ENV && !["development", "production", "test"].includes(requiredVars.NODE_ENV)) {
    errors.push("NODE_ENV must be one of: development, production, test");
  }

  // Validate PORT
  const port = Number(requiredVars.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push("PORT must be a valid port number between 1 and 65535");
  }

  // Validate CORS origins for production
  if (requiredVars.NODE_ENV === "production" && requiredVars.CORS_ORIGIN) {
    const origins = requiredVars.CORS_ORIGIN.split(",").map(o => o.trim());
    origins.forEach(origin => {
      if (!origin.startsWith("https://")) {
        errors.push(`CORS origin must use HTTPS in production: ${origin}`);
      }
    });
  }

  // Validate database URL format
  if (requiredVars.DATABASE_URL && !requiredVars.DATABASE_URL.startsWith("postgresql://")) {
    errors.push("DATABASE_URL must be a valid PostgreSQL connection string");
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map(e => `  - ${e}`).join("\n")}`
    );
  }

  return {
    DATABASE_URL: requiredVars.DATABASE_URL!,
    JWT_SECRET: requiredVars.JWT_SECRET!,
    NODE_ENV: requiredVars.NODE_ENV!,
    PORT: Number(requiredVars.PORT!),
    CORS_ORIGIN: requiredVars.CORS_ORIGIN!,
  };
}

export function logEnvironmentInfo(): void {
  console.log("🔧 Environment Configuration:");
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  PORT: ${process.env.PORT}`);
  console.log(`  Database: ${process.env.DATABASE_URL ? "✓ Configured" : "✗ Missing"}`);
  console.log(`  JWT Secret: ${process.env.JWT_SECRET ? "✓ Configured" : "✗ Missing"}`);
  console.log(`  CORS Origins: ${process.env.CORS_ORIGIN || "default"}`);
}