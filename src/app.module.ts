import { Module } from "@nestjs/common";
import { AppService } from "./services";
import { AppController } from "./controllers";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
