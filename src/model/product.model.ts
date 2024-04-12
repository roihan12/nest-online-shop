import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { CreateVariantRequest, VariantResponse } from './variant.model';
import { ImageResponse } from './image.model';
import { ReviewResponse } from './review.model';

export class ProductResponse {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  @ApiProperty({
    example: '1bb025b7-b916-43a2-be35-2ac83bdf603d',
  })
  brand_id: string;

  @ApiProperty({
    example: '6c86b6f7-886f-48d0-a75d-f005bf7385c4',
  })
  category_id: string;

  @ApiProperty({
    example: 'Product 1',
  })
  name: string;

  @ApiProperty({
    example: 'product-1',
  })
  slug: string;

  @ApiProperty({
    example: '100000',
  })
  price?: number;

  @ApiProperty({
    example:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution',
  })
  description: string;

  @ApiProperty({
    example: '100',
  })
  stock_sold: number;

  @ApiProperty({
    example: '10',
  })
  weight: number;

  @ApiProperty({
    example: 'https://example.com/image.png',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  is_featured: boolean;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  is_variant: boolean;

  @ApiProperty({
    example: false,
    type: Boolean,
  })
  is_archived: boolean;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(VariantResponse) }],
    },
  })
  variants?: VariantResponse[];

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(ImageResponse) }],
    },
  })
  images?: ImageResponse[];

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(ReviewResponse) }],
    },
  })
  reviews?: ReviewResponse[];

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class CreateProductRequest {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
    required: true,
  })
  brand_id: string;
  @ApiProperty({
    example: 'ae4adbbf-eb9f-4d7d-8032-e93cb6c7f844',
    required: true,
  })
  category_id: string;
  @ApiProperty({
    example: 'Product 1',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: '100000',
  })
  price: number;

  @ApiProperty({
    example: '10',
  })
  weight: number;

  @ApiProperty({
    example:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution',
  })
  description: string;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  is_featured: boolean;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  is_variant: boolean;

  @ApiProperty({
    allOf: [
      {
        properties: {
          data: {
            oneOf: [{ $ref: getSchemaPath(CreateVariantRequest) }],
          },
        },
      },
    ],
  })
  variants?: CreateVariantRequest[];
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  product_images: any[];
}

export class UpdateProductRequest {
  id: string;
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
    required: true,
  })
  brand_id: string;
  @ApiProperty({
    example: 'ae4adbbf-eb9f-4d7d-8032-e93cb6c7f844',
    required: true,
  })
  category_id: string;
  @ApiProperty({
    example: 'Product 1',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: '100000',
  })
  price: number;

  @ApiProperty({
    example:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution',
  })
  description: string;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  is_featured: boolean;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  is_variant: boolean;

  @ApiProperty({
    example: '10',
  })
  weight: number;

  @ApiProperty({
    example: 'https://example.com/image.png',
  })
  status: 'ACTIVE' | 'INACTIVE';
}

export class SearchProductsRequest {
  @ApiProperty({
    example: 'Product 1',
    required: false,
  })
  name?: string;
  @ApiProperty({
    example: 'ae4adbbf-eb9f-4d7d-8032-e93cb6c7f844',
    required: false,
  })
  brand_id?: string;
  @ApiProperty({
    example: 'aedfdfbbf-eb9f-4d7d-8032-ht3cb6hh447',
    required: false,
  })
  category_id?: string;
  @ApiProperty({
    example: 1000,
    type: Number,
  })
  pmax?: number;
  @ApiProperty({
    example: 1000000,
    type: Number,
  })
  pmin?: number;
  @ApiProperty({
    enum: [
      'asc',
      'desc',
      'Price (Low to High)',
      'Price (High to Low)',
      'Best Selling',
    ],
    required: false,
  })
  sort?:
    | 'asc'
    | 'desc'
    | 'Price (Low to High)'
    | 'Price (High to Low)'
    | 'Best Selling';
  @ApiProperty({
    example: 1,
    type: Number,
  })
  page: number;

  @ApiProperty({
    example: 10,
    type: Number,
  })
  size: number;
}
