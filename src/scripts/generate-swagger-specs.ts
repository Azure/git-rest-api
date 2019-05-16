import { saveSwagger } from "./swagger-generation";

void saveSwagger().then(() => {
  // tslint:disable-next-line: no-console
  console.log("Generated the specs");
});
