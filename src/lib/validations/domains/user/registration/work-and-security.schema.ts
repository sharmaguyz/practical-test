import { z } from "zod";

export const workSchema = z.object({
  securityClearance: z.string().optional(),
  workAuthorization: z.string().optional(),
  // workType: z.array(z.string()).optional(),
  workType: z.array(
    z.union([
      z.number(),
      z.string().transform(val => isNaN(Number(val)) ? val : Number(val))
    ])
  ).optional().default([]),
  activelySeeking: z.preprocess(
    val => val === 'true',
    z.boolean()
  ).optional(),
  profileVisible: z.preprocess(
    val => val === 'true',
    z.boolean()
  ).optional(),
  // technicalSkills: z.array(z.string()).optional(),
  technicalSkills: z.array(
    z.union([
      z.number(),
      z.string().transform(val => isNaN(Number(val)) ? val : Number(val))
    ])
  ).optional().default([]),
});

export type WorkSchema = z.infer<typeof workSchema>;