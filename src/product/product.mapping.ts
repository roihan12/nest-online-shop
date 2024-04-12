import { Image, Product, Review, Variant } from '@prisma/client';
import { ProductResponse } from 'src/model/product.model';

export function toProductResponse(
  productData: Product,
  image?: Image[],
  variants?: Variant[],
  reviews?: Review[],
): ProductResponse {
  return {
    id: productData.id,
    brand_id: productData.brand_id,
    category_id: productData.category_id,
    name: productData.name,
    price: productData.price,
    weight: productData.weight,
    slug: productData.slug,
    status: productData.status as 'ACTIVE' | 'INACTIVE',
    is_archived: productData.is_archived,
    description: productData.description,
    is_featured: productData.is_featured,
    is_variant: productData.is_variant,
    images: image,
    variants: variants,
    reviews: reviews,
    stock_sold: productData.stock_sold,
    created_at: productData.created_at,
    updated_at: productData.updated_at,
  };
}

export const slugify = (text: string): string => {
  return text
    .toString() // Cast to string (optional)
    .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\_/g, '-') // Replace _ with -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/\-$/g, ''); // Remove trailing -
};
