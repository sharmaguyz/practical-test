import { z } from "zod";
import { dateSchema } from "@/lib/validations/shared/schemas/date";

export const educationSchema = z.object({
  highestDegree: z.string().min(1, "Highest degree is required"),
  currentlyEnrolled: z.string().optional(),
  // university: z.string().optional(),
  university: z.string()
    .optional()
    .refine((val) => {
      // If the value is empty or undefined, it's valid (optional field)
      if (!val) return true;
      
      // Check the pattern for non-empty values
      return /^[A-Za-z0-9\s,.()-]+$/.test(val);
    }, {
      message: "University name must contain only letters, numbers, and basic punctuation"
  }),
  graduationDate: z.preprocess((val) => {
    // Handle empty values - trigger required_error
    if (val === null || val === undefined || val === '') {
      return undefined;
    }

    // Convert to Date if it's a string
    if (typeof val === 'string' || val instanceof Date) {
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }

    return val;
  },
  z.date({
    required_error: "Graduation date is required",
    invalid_type_error: "Invalid date",
  })).refine((date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
  }, {
    message: "Date must be today or a future date",
  }).default(""),
  // graduationDate: dateSchema,
  yearsOfExperience: z.any().optional(),
  certifications: z.array(z.string()).optional().default([]),
  otherCertification: z.string().optional()
}).superRefine((data, ctx) => {
  console.log(data.certifications, "certifications");
  console.log(data.otherCertification, "otherCertification");
  if (data.certifications?.some(val => Number(val) === 9) && !data.otherCertification) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your certification",
      path: ["otherCertification"]
    });
  }
});

export type EducationSchema = z.infer<typeof educationSchema>;