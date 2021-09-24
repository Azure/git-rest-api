import { Controller, Get } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

@Controller("/health")
export class HealthCheckController {
  @Get("/alive")
  @ApiOperation({ summary: "Check alive", operationId: "health_checkAlive" })
  public async getAlive() {
    return "alive";
  }
}
