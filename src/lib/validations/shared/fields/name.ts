import { z } from "zod";

export const nameSchema = (label: string) => {
  return z
    .string()
    .nonempty(`${label} is required`) // 👈 handles empty string ""
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must be at most 50 characters`)
    .regex(/^[a-zA-Z\s]+$/, `${label} can only contain alphabets and spaces`);
};