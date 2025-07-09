import { z } from "zod";

export const secondStepSchema = z.object({
    jobTitle : z.string().nonempty('Job title or position in required').regex(/^[a-zA-Z0-9\s]+$/, 'Job title must not contain special characters'),
    organization : z.string().optional(),
    bio:z.string().optional()
});

export type SecondStepSchem = z.infer<typeof secondStepSchema>;