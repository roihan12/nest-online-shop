import { ApiProperty } from '@nestjs/swagger';

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
    example: '100000',
  })
  price: number;

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
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class CreateCategoryRequest {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  billboardId: string;
  @ApiProperty({
    example: 'category 1',
    required: true,
  })
  name: string;
}

export class UpdateCategoryRequest {
  id: string;
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
    required: false,
  })
  billboardId: string;
  @ApiProperty({
    example: 'Category updated 1',
    required: false,
  })
  name?: string;
}
