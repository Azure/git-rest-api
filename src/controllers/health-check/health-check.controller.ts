import { Controller, Get } from "@nestjs/common";

@Controller("/health")
export class HealthCheckController {
  @Get("/alive")
  public async getAlive() {
    return "alive";
  }
}
