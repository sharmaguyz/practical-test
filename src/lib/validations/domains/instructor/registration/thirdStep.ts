import { z } from "zod";

export const thirdStepSchema = z.object({
    expectedStudents: z.string().nonempty("Expected students is required"),
    topicTeach : z.string().nonempty("Topics you want to teach is required"),
    termsCondition:z.literal(true, {
        errorMap: () => ({ message: "You must accept the terms and conditions" }),
    })
});
export type ThirdStepSchema = z.infer<typeof thirdStepSchema>;