import { Controller, Get } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { AppService } from "../services";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    this.appService.getHello();
  }

  @Get()
  @ApiOperation({ title: "home", operationId: "home" })
  public getHello(): string {
    return this.appService.getHello();
  }
}
