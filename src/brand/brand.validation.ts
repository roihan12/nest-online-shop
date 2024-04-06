import { z, ZodType } from 'zod';

export class BrandValidation {
  static readonly Create: ZodType = z.object({
    name: z.string().min(1).max(100),
    file: z.string(),
  });
  static readonly Update: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    name: z.string().min(1).max(100).optional(),
  });
}
