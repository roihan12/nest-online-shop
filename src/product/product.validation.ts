import { z, ZodType } from 'zod';

const Variant = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  price: z.number().positive(),
  stock: z.number().positive(),
});
export class ProductValidation {
  static readonly Create: ZodType = z.object({
    brand_id: z.string().min(1).max(100).uuid(),
    category_id: z.string().min(1).max(100).uuid(),
    name: z.string().min(1).max(150),
    price: z.number().positive().optional(),
    description: z.string().min(1).max(1000),
    weight: z.number().positive(),
    is_featured: z.boolean(),
    is_variant: z.boolean(),
    variants: z.array(Variant).optional(),
  });

  static readonly Update: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    brand_id: z.string().min(1).max(100).uuid(),
    category_id: z.string().min(1).max(100).uuid(),
    name: z.string().min(1).max(150),
    price: z.number().positive().optional(),
    description: z.string().min(1).max(1000).optional(),
    weight: z.number().positive().optional(),
    is_featured: z.boolean().optional(),
    is_variant: z.boolean().optional(),
  });

  static readonly SEARCH: ZodType = z.object({
    name: z.string().min(1).optional(),
    brand_id: z.string().min(1).max(100).uuid().optional(),
    category_id: z.string().min(1).max(100).uuid().optional(),
    pmax: z.number().positive().optional(),
    pmin: z.number().positive().optional(),
    sort: z
      .enum(['asc', 'desc', 'Price (Low to High)', 'Price (High to Low)'])
      .optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
