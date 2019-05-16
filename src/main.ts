import { createApp } from "./app";

async function bootstrap() {
  const { app } = await createApp();
  await app.listen(3009);
}

bootstrap().catch(error => {
  // tslint:disable-next-line: no-console
  console.error("Error in app", error);
  process.exit(1);
});
