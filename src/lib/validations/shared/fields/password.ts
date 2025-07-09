import { z } from "zod";
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password cannot exceed 16 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character")
  .refine(password => !password.includes(' '), "Password cannot contain spaces");

export type PasswordSchema = z.infer<typeof passwordSchema>;