import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

const magicLinkSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
});

// Infer types from schemas
type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;
type MagicLinkData = z.infer<typeof magicLinkSchema>;

// Export schemas and types using named exports for better module resolution
export {
    registerSchema,
    loginSchema,
    magicLinkSchema,
};
export type {
    RegisterData,
    LoginData,
    MagicLinkData,
};

