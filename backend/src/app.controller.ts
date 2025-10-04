
import { Controller, Get } from "@nestjs/common";

type HelloResponse = {
  message: string;
  version: string;
  documentation: string;
  health: string;
  timestamp: string;
  endpoints: {
    cats: string;
    pedigrees: string;
    breeds: string;
    coatColors: string;
  };
};

type HealthResponse = {
  status: string;
  timestamp: string;
  service: string;
  version: string;
};

@Controller()
export class AppController {
  @Get()
  getHello(): HelloResponse {
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
  getHealth(): HealthResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Cat Management System API",
      version: "1.0.0",
    };
  }
}
