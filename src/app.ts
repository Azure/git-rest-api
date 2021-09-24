import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { NestLogger } from "./core/logger/nest-logger";

export async function createApp() {
  const app = await NestFactory.create(AppModule, {
    logger: new NestLogger(),
  });
  app.enableCors();
  app.use(helmet());

  const options = new DocumentBuilder()
    .setTitle("GIT Rest API")
    .setDescription("Rest api to run operation on git repositories")
    .setVersion("1.0")
    .addServer("http://")
    .addServer("https://")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("swagger", app, document);
  return { app, document };
}
