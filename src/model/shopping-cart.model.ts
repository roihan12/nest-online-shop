import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ProductResponse } from './product.model';
import { VariantResponse } from './variant.model';

export class ShoppingCartResponse {
  @ApiProperty({
    example: 'bb75f39c-ca23-4045-a3c1-5516ce5af205',
  })
  id: string;

  @ApiProperty({
    example: 'afe8f509-6f6e-4d64-bdc5-5bd09b6bd87b',
  })
  user_id: string;

  @ApiProperty({
    example: '627102c4-6711-43b6-b8d1-801075c1cd35',
  })
  product_id: string;

  @ApiProperty({
    example: '721f9f49-a83a-4ec1-8ebd-e1a21b5e75f8',
  })
  variant_id?: string;

  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(ProductResponse) }],
  })
  product?: ProductResponse;

  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(VariantResponse) }],
  })
  variants?: VariantResponse;

  @ApiProperty({
    example: 4,
  })
  quantity: number;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class DeleteShoppingCartRequest {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;

  user_id: string;
}

export class GetShoppingCartRequest {
  product_id: string;
  user_id: string;
}

export class CreateShoppingCartRequest {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  product_id: string;

  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  variant_id?: string;
  @ApiProperty({
    example: 4,
  })
  quantity: number;

  user_id: string;
}

export class UpdateShoppingCartRequest {
  id: string;

  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  product_id: string;

  user_id: string;

  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  variant_id?: string;

  @ApiProperty({
    example: 4,
  })
  quantity: number;
}
