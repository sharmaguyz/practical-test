import { z } from "zod";
import { nameSchema } from "@/lib/validations/shared/fields/name";
import { API_BASE_URL } from "@/components/config/config";
export const firstStepSchema = z.object({
    fullName: nameSchema("Full name"),
   email: z.string()
     .min(1, "Email is required")
     .email("Invalid email format")
     .transform((val) => val.toLowerCase())
     .refine((val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
        message: "Email format not allowed",
      })
     .refine(async (email) => {
       // Only proceed if email is non-empty and valid
       if (!email || !z.string().email().safeParse(email).success) {
         return true; // Skip API check if invalid
       }
   
       // Hit API only if email is valid
       try {
         const response = await fetch(`${API_BASE_URL}/api/v1/users/exists`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email }),
         });
         const { data } = await response.json();
         return !data.exists; // Return false if email exists
       } catch (error) {
         console.error("API error:", error);
         return true; // Assume valid if API fails (or handle differently)
       }
     }, "Your email is already registered as student"),
    phoneNumber: z.union([
        z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number"),
        z.literal('')
    ]).optional(),
    profilePic: z
        .any()
        .transform((file) => (file instanceof File ? file : undefined))
        .refine(
            (file) =>
            !file || ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
            {
                message: 'Only JPG, JPEG, or PNG files are allowed',
            }
        )
    .optional(),
});

export type FirstStepSchema = z.infer<typeof firstStepSchema>;