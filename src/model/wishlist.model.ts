import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ProductResponse } from './product.model';

export class WishlistResponse {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  @ApiProperty({
    example: '6c86b6f7-886f-48d0-a75d-f005bf7385c4',
  })
  user_id: string;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(ProductResponse) }],
    },
  })
  product?: ProductResponse[];

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class DeleteWishlistRequest {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  user_id: string;
}

export class GetWishlistRequest {
  product_id: string;
  user_id: string;
}

export class CreateWishlistRequest {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  product_id: string;

  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  user_id: string;
}
