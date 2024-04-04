import { ZodType, z } from 'zod';

const roles = ['ADMIN', 'USER', 'OWNER'] as const;
export class UserValidation {
  static readonly UPDATE: ZodType = z
    .object({
      full_name: z.string().min(1).max(100).optional(),
      username: z.string().min(1).max(100).optional(),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be more than 8 characters' })
        .max(32, { message: 'Password must be less than 32 characters' })
        .optional(),
      role: z.enum(roles).optional(),
      confirmPassword: z
        .string({
          required_error: 'Please confirm your password',
        })
        .optional(),

      file: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    });

  static readonly CREATE: ZodType = z
    .object({
      full_name: z.string().min(1).max(100),
      username: z.string().min(1).max(100),
      email: z.string().email(),
      role: z.enum(roles),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be more than 8 characters' })
        .max(32, { message: 'Password must be less than 32 characters' }),
      confirmPassword: z.string({
        required_error: 'Please confirm your password',
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    });
}
