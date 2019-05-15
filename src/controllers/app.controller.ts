import { Controller, Get } from "@nestjs/common";

import { AppService } from "../services";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    this.appService.getHello();
  }

  @Get()
  public getHello(): string {
    return this.appService.getHello();
  }
}
