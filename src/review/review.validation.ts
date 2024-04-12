import { z, ZodType } from 'zod';

export class ReviewValidation {
  static readonly Create: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
    transactions_item_id: z.string().min(1).max(100),
    rating: z.number().positive(),
    message: z.string().min(1).max(255),
  });

  static readonly Update: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
    rating: z.number().positive(),
    message: z.string().min(1).max(255),
  });

  static readonly Delete: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
  });

  static readonly GetReviews: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
