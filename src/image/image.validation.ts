import { z, ZodType } from 'zod';

export class ImageValidation {
  static readonly GET: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    image_id: z.string().min(1).max(100).uuid(),
  });

  static readonly Delete: ZodType = z.object({
    product_id: z.string().min(1).max(100).uuid(),
    image_id: z.string().min(1).max(100).uuid(),
  });
}
