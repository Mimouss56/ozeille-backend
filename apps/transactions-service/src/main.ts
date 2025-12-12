import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

import { AppModule } from "./app.module";
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter";
import { ZodValidationExceptionFilter } from "./common/filters/validation.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ZodValidationExceptionFilter(), new PrismaExceptionFilter());

  const port = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === "production";
  const env = process.env.NODE_ENV || "development";
  const version = "1.0.0";

  const docTitle = `LaPince API (${env.toUpperCase()})`;
  const docVersion = env === "production" ? version : `${version}-${env}`;
  const docDescription = 'API de gestion budgétaire "LaPince';

  const builder = new DocumentBuilder()
    .setTitle(docTitle)
    .setDescription(docDescription)
    .setVersion(docVersion)
    .setContact("Support LaPince", "", "");

  if (isProduction) {
    const prodUrl = process.env.PROD_API_URL || "";
    builder.addServer(prodUrl, "Prod Environment");
  } else {
    builder.addServer(`http://localhost:${port}`, "Dev Environment");
  }

  const config = builder.build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, cleanupOpenApiDoc(document), {
    customSiteTitle: "LaPince API Docs",
    swaggerOptions: {
      filter: true,
    },
  });

  await app.listen(port);
}

bootstrap();
