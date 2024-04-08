import { Variant } from '@prisma/client';
import { VariantResponse } from 'src/model/variant.model';

export function toVariantResponse(variantData: Variant): VariantResponse {
  return {
    id: variantData.id,
    product_id: variantData.product_id,
    name: variantData.name,
    value: variantData.value,
    price: variantData.price,
    stock: variantData.stock,
    image_url: variantData.image_url,
    status: variantData.status as 'ACTIVE' | 'INACTIVE',
    created_at: variantData.created_at,
    updated_at: variantData.updated_at,
  };
}
