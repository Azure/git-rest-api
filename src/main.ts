import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle("GIT Rest API")
    .setDescription("Rest api to run operation on git repositories")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("swagger", app, document);

  await app.listen(3009);
}

bootstrap().catch(error => {
  // tslint:disable-next-line: no-console
  console.error("Error in app", error);
  process.exit(1);
});
