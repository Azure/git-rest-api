import { createApp } from "./app";
import { Logger } from "./core";

async function bootstrap() {
  const { app } = await createApp();
  await app.listen(3009);
}

bootstrap().catch(error => {
  const logger = new Logger("Bootstrap");
  // tslint:disable-next-line: no-console
  logger.error("Error in app", error);
  process.exit(1);
});
