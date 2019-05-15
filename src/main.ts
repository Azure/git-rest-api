import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3009);
}

bootstrap().catch(error => {
  // tslint:disable-next-line: no-console
  console.error("Error in app", error);
  process.exit(1);
});
