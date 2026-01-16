import { z } from "zod";

export const hexColorSchema = z
  .string("Color must be a string")
  // Le regex pour les couleurs Hex, par exemple #FFF ou #FFFFFF
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Color must be a valid Hex code (ex : #FFFFFF or #FFF)",
  });
