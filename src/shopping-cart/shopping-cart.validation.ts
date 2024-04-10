import { z, ZodType } from 'zod';

export class ShoopingCartValidation {
  static readonly Create: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
    variant_id: z.string().min(1).max(100).uuid().optional(),
    quantity: z.number().positive(),
  });

  static readonly Update: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
    product_id: z.string().min(1).max(100).uuid(),
    variant_id: z.string().min(1).max(100).uuid(),
    quantity: z.number().positive(),
  });

  static readonly Delete: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
  });
}
