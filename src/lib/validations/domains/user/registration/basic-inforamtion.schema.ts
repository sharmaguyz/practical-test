import { z } from "zod";
import { nameSchema } from "@/lib/validations/shared/fields/name";
import { passwordSchema } from "@/lib/validations/shared/fields/password";
import { API_BASE_URL } from "@/components/config/config";

export const basicInfoSchema = z.object({
  fullName: nameSchema("Full name"),
  email: z.string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email must be less than 255 characters")
  .email("Invalid email format")
  .refine((val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
    message: "Email format not allowed",
  })
  .transform((val) => val.toLowerCase())
  .superRefine(async (email, ctx) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const { data } = await response.json();

      if (data.exists) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email already registered",
        });
      }
    } catch (error) {
      console.error("API error:", error);
      // Optionally: ctx.addIssue({ ... }) if you want to fail on API errors
    }
  }),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm Password is required"),
  // confirmPassword: z.string()
  // .min(1, "Confirm Password is required")
  // .transform((val, ctx) => {
  //   console.log("val :",val)
  //   console.log("ctx :",ctx)
  //   if (val !== ctx?.parent?.password) {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: "Passwords don't match",
  //     });
  //     return val; // or return something else if needed
  //   }
  //   return val;
  // }),
  phoneNumber: z.union([
    z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number"),
    z.literal('')
  ]).optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().min(1, "City is required"),
  linkedin: z.string()
  .refine((val) => val === '' || /^https:\/\/(www\.)?linkedin\.com\/.*$/.test(val), {
    message: "LinkedIn must be a valid LinkedIn profile URL",
  })
  .optional(),
  // linkedin: z.string()
  //   .url("Invalid LinkedIn URL")
  //   .or(z.literal(''))
  //   .optional(),
  portfolio: z.string()
  .refine((val) => val === '' || /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/?$/.test(val), {
    message: "GitHub/Portfolio must be a valid GitHub profile URL",
  })
  .optional(),
  // portfolio: z.string()
  //   .url("Invalid portfolio URL")
  //   .or(z.literal(''))
  //   .optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type BasicInfoSchema = z.infer<typeof basicInfoSchema>;