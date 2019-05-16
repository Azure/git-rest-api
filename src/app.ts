import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle("GIT Rest API")
    .setDescription("Rest api to run operation on git repositories")
    .setVersion("1.0")
    .setSchemes("http", "https")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("swagger", app, document);
  return { app, document };
}
