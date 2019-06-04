import { ApiModelProperty } from "@nestjs/swagger";
import { SwaggerEnumType } from "@nestjs/swagger/dist/types/swagger-enum.type";

/**
 * Decorator to let swagger know about all the pagination properties available
 */
export function ApiModelEnum(metadata: { [enumName: string]: SwaggerEnumType }): PropertyDecorator {
  const enumName = Object.keys(metadata)[0];
  if (!enumName) {
    throw new Error("You must provide an enum to ApiModelEnum. `@ApiModelEnum({ Myenum })`");
  }
  return ApiModelProperty({
    enum: metadata[enumName],
    // Adding custom properties for auto rest
    "x-ms-enum": { name: enumName },
  } as any);
}
