import { z, ZodType } from 'zod';

export class BillboardValidation {
  static readonly Create: ZodType = z.object({
    label: z.string().min(1).max(100),
    file: z.string(),
  });
  static readonly Update: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    label: z.string().min(1).max(100).optional(),
  });
}
