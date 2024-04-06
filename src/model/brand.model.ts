import { ApiProperty } from '@nestjs/swagger';

export class BrandResponse {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  @ApiProperty({
    example: 'Brand 1',
  })
  name: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
  })
  imageUrl: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class CreateBrandRequest {
  @ApiProperty({
    example: 'Brand 1',
    required: true,
  })
  name: string;
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: any;
}

export class UpdateBrandRequest {
  id: string;
  @ApiProperty({
    example: 'Brand 1',
    required: false,
  })
  name?: string;
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: any;
}
