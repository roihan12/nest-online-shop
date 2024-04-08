import { z, ZodType } from 'zod';

export class VariantValidation {
  static readonly Create: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    name: z.string().min(1).max(100),
    value: z.string().min(1).max(100),
    price: z
      .union([
        z.string().transform((x) => x.replace(/[^0-9.-]+/g, '')),
        z.number().positive(),
      ])
      .pipe(z.coerce.number().min(1).max(999999999)),
    stock: z.number().positive(),
  });
  static readonly Update: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    product_id: z.string().min(1).max(100).uuid(),
    name: z.string().min(1).max(100).optional(),
    value: z.string().min(1).max(100).optional(),
    price: z
      .union([
        z.string().transform((x) => x.replace(/[^0-9.-]+/g, '')),
        z.number().positive(),
      ])
      .pipe(z.coerce.number().min(1).max(999999999))
      .optional(),
    stock: z.number().positive().optional(),
  });

  static readonly GET: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    variant_id: z.string().min(1).max(100).uuid(),
  });

  static readonly Delete: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    variant_id: z.string().min(1).max(100).uuid(),
  });
}
