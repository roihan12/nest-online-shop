import { ApiProperty } from '@nestjs/swagger';

export class VariantResponse {
  @ApiProperty({
    example: '92614dae-a3b1-4427-834d-7a3b21ae15db',
  })
  id: string;

  @ApiProperty({
    example: '949e39ec-74c1-4260-8491-6f3a15e2e794',
  })
  product_id: string;

  @ApiProperty({
    example: 'Variant 1',
  })
  name: string;

  @ApiProperty({
    example: 'value 1',
  })
  value: string;

  @ApiProperty({
    example: '100000',
  })
  price: number;

  @ApiProperty({
    example: '10',
  })
  stock: number;

  @ApiProperty({
    example: 'https://example.com/image.png',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class CreateVariantRequest {
  @ApiProperty({
    example: '949e39ec-74c1-4260-8491-6f3a15e2e794',
  })
  product_id: string;

  @ApiProperty({
    example: 'Variant 1',
  })
  name: string;

  @ApiProperty({
    example: 'value 1',
  })
  value: string;

  @ApiProperty({
    example: '100000',
  })
  price: number;

  @ApiProperty({
    example: '10',
  })
  stock: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  variant_image: any;
}

export class UpdateVariantRequest {
  id: string;
  @ApiProperty({
    example: '949e39ec-74c1-4260-8491-6f3a15e2e794',
  })
  product_id: string;

  @ApiProperty({
    example: 'Variant 1',
  })
  name: string;

  @ApiProperty({
    example: 'value 1',
  })
  value: string;

  @ApiProperty({
    example: '100000',
  })
  price: number;

  @ApiProperty({
    example: '10',
  })
  stock: number;
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  variant_image: any;
}
