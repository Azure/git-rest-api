import { Controller, Get } from "@nestjs/common";

@Controller("/health")
export class HealthCheckController {
  constructor() {}

  @Get("/alive")
  public async getAlive() {
    return "alive";
  }
}
