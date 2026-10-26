import { z } from 'zod';

export const registerSchema = z.object({
    fullName: z.string().trim().min(4, "Full name must be at least 4 characters long"),
    userName: z.string().trim().min(4, "Username must be at least 4 characters long"),
    email: z.string().trim().pipe(z.email("Invalid email format")),
    password: z.string()
        .min(6, "Password must be at least 6 characters long")
        .refine((password) => password.trim().length > 0, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    userType: z.enum(['EMPLOYER', 'CANDIDATE'], {
        error: "Wrong user type.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
