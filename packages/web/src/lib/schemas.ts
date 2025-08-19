import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});


const magicLinkSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
});

// Infer types from schemas
type RegisterData = z.infer<typeof registerSchema>;
type MagicLinkData = z.infer<typeof magicLinkSchema>;

// Export schemas and types using named exports for better module resolution
export {
    registerSchema,
    magicLinkSchema,
};
export type {
    RegisterData,
    MagicLinkData,
};

