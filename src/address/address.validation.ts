import { z, ZodType } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(100),
    phone: z.string().min(1).max(20),
    street: z.string().min(1).max(255),
    city: z.string().min(1).max(100),
    province: z.string().min(1).max(100),
    subdistrict: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    is__default: z.boolean(),
    postal_code: z.string().min(1).max(10),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1).max(100).uuid(),
    name: z.string().min(1).max(100),
    phone: z.string().min(1).max(20),
    street: z.string().min(1).max(255),
    city: z.string().min(1).max(100),
    province: z.string().min(1).max(100),
    subdistrict: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    is__default: z.boolean(),
    postal_code: z.string().min(1).max(10),
  });
}
