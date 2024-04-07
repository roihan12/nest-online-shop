import { ApiProperty } from '@nestjs/swagger';

export class ImageResponse {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  @ApiProperty({
    example: '1042930b-ef05-4ad7-beb4-39674dbd6817',
  })
  product_id: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
  })
  url: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class CreateImageRequest {
  product_id: string;
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: any;
}
