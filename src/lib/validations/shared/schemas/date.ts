import { z } from "zod";

export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
  .refine(str => {
    const date = new Date(str);
    return !isNaN(date.getTime());
  }, "Invalid date");