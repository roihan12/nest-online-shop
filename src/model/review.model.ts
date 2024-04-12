import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponse {
  @ApiProperty({
    example: 'bb75f39c-ca23-4045-a3c1-5516ce5af205',
  })
  id: string;

  @ApiProperty({
    example: 'afe8f509-6f6e-4d64-bdc5-5bd09b6bd87b',
  })
  user_id?: string;

  @ApiProperty({
    example: '627102c4-6711-43b6-b8d1-801075c1cd35',
  })
  product_id: string;

  @ApiProperty({
    example: '721f9f49-a83a-4ec1-8ebd-e1a21b5e75f8',
  })
  transactions_item_id?: string;

  @ApiProperty({
    example: 4,
  })
  rating: number;

  @ApiProperty({
    example: 'This is a review',
  })
  message: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class DeleteReviewRequest {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  user_id: string;
}

export class CreateReviewRequest {
  @ApiProperty({
    example: '627102c4-6711-43b6-b8d1-801075c1cd35',
  })
  product_id: string;

  @ApiProperty({
    example: '721f9f49-a83a-4ec1-8ebd-e1a21b5e75f8',
  })
  transactions_item_id: string;

  @ApiProperty({
    example: 4,
  })
  rating: number;

  @ApiProperty({
    example: 'This is a review',
  })
  message: string;

  user_id: string;
}

export class UpdateReviewRequest {
  id: string;

  user_id: string;

  @ApiProperty({
    example: 4,
  })
  rating: number;

  @ApiProperty({
    example: 'This is a review',
  })
  message: string;
}

export class GetReviewOfProduct {
  @ApiProperty({
    example: '627102c4-6711-43b6-b8d1-801075c1cd35',
  })
  product_id: string;

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
