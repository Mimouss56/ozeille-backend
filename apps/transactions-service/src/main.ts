import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

import { AppModule } from "./app.module";
import { ZodValidationExceptionFilter } from "./common/filters/validation.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ZodValidationExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("LaPince Api NestJs")
    .setDescription("LaPince API description")
    .setVersion("1.0")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, cleanupOpenApiDoc(documentFactory()));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
