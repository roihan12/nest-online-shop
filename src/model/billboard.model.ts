import { ApiProperty } from '@nestjs/swagger';

export class BillboardResponse {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  @ApiProperty({
    example: 'Billboard 1',
  })
  label: string;

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

export class CreateBillboardRequest {
  @ApiProperty({
    example: 'Billboard 1',
    required: true,
  })
  label: string;
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: any;
}

export class UpdateBillboardRequest {
  id: string;
  @ApiProperty({
    example: 'Billboard 1',
    required: false,
  })
  label?: string;
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: any;
}
