import { Module } from "@nestjs/common";

import { AppController } from "./controllers";
import { AppService } from "./services";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
