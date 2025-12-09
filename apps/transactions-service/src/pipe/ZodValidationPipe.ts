import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown, _: ArgumentMetadata): unknown {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch {
      throw new BadRequestException("Validation failed");
    }
  }
}
