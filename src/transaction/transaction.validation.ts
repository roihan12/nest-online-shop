import { z, ZodType } from 'zod';

const status = [
  'PAID',
  'CANCELED',
  'SHIPPING',
  'DELIVERED',
  'PENDING_PAYMENT',
] as const;
const item = z.object({
  product_id: z.string().min(1).max(100).uuid(),
  variant_id: z.string().min(1).max(100).uuid().optional(),
  quantity: z.number().positive(),
});
export class TransactionValidation {
  static readonly Create: ZodType = z.object({
    address_id: z.string().min(1).max(100).uuid(),
    user_id: z.string().min(1).max(100).uuid(),
    customer_name: z.string().min(1).max(100),
    customer_email: z.string().min(1).max(100).email(),
    courier: z.string().min(1).max(100),
    shipping_method: z.string().min(1).max(100),
    shipping_cost: z.number().positive(),
    item_details: z.array(item).nonempty(),
  });

  static readonly Update: ZodType = z.object({
    id: z.string().min(1).max(100),
    status: z.enum(status).optional(),
  });

  static readonly Filter: ZodType = z.object({
    status: z.enum(status).optional(),
    page: z.number().min(1).positive(),
    size: z.number().min(1).max(100).positive(),
  });
}
