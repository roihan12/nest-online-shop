import { z, ZodType } from 'zod';

export class ProductValidation {
  static readonly Create: ZodType = z.object({
    brand_id: z.string().min(1).max(100).uuid(),
    category_id: z.string().min(1).max(100).uuid(),
    name: z.string().min(1).max(150),
    price: z.number().positive(),
    description: z.string().min(1).max(1000),
    weight: z.number().positive(),
    is_featured: z.boolean(),
    is_variant: z.boolean(),
  });
}
