import { Controller, Get } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

@Controller("/health")
export class HealthCheckController {
  @Get("/alive")
  @ApiOperation({ title: "Check alive", operationId: "checkAlive" })
  public async getAlive() {
    return "alive";
  }
}
