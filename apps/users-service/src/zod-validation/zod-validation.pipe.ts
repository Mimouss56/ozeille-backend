import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodError, ZodType } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodType) {}

  transform(value: unknown, _: ArgumentMetadata): unknown {
    if (!this.schema) {
      throw new BadRequestException("Validation schema not provided to ZodValidationPipe");
    }

    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: "Validation failed",
          errors: error.issues,
        });
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(message);
    }
  }
}
