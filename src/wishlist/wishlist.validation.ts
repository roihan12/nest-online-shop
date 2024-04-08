import { z, ZodType } from 'zod';

export class WishlistValidation {
  static readonly Create: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
  });

  static readonly Delete: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
  });
}
