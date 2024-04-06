import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponse {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  @ApiProperty({
    example: 'Category 1',
  })
  name: string;
  @ApiProperty({
    example: 'ca00faaf-6b05-4ce5-9b4a-dae268df590a',
  })
  billboardId: string;

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
