import { z, ZodType } from 'zod';

export class CategoryValidation {
  static readonly Create: ZodType = z.object({
    billboardId: z.string().min(1).max(100),
    name: z.string().min(1).max(100),
  });
  static readonly Update: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    billboardId: z.string().min(1).max(100).optional(),
    label: z.string().min(1).max(100).optional(),
  });
}
