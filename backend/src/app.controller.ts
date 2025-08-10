import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): any {
    return {
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
    };
  }

  @Get("health")
  getHealth(): any {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Cat Management System API",
      version: "1.0.0",
    };
  }
}
