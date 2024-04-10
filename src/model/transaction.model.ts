import { TransactionItemResponse } from './transaction-item.model';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ShoppingCartResponse } from './shopping-cart.model';

export class TransactionResponse {
  @ApiProperty({
    example: 'bb75f39c-ca23-4045-a3c1-5516ce5af205',
  })
  id: string;

  @ApiProperty({
    example: 'afe8f509-6f6e-4d64-bdc5-5bd09b6bd87b',
  })
  user_id: string;

  @ApiProperty({
    example: 'afe8f509-6f6e-4d64-bdc5-5bd09b6bd87b',
  })
  address_id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  customer_name: string;

  @ApiProperty({
    example: 'johndoe@gmail.com',
  })
  customer_email: string;

  @ApiProperty({
    example: '721f9f49-a83a-4ec1-8ebd-e1a21b5e75f8',
  })
  snap_token: string;

  @ApiProperty({
    example:
      'https://app.sandbox.midtrans.com/snap/v1/transactions/721f9f49-a83a-4ec1-8ebd-e1a21b5e75f8/redirect',
  })
  snap_redirect_url: string;

  @ApiProperty({
    example: 'CreditCard',
  })
  payment_method: string;

  @ApiProperty({
    example: 'JNE',
  })
  courier: string;

  @ApiProperty({
    example: 'REG',
  })
  shipping_method: string;

  @ApiProperty({
    example: 10000,
  })
  shipping_cost: number;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(TransactionItemResponse) }],
    },
  })
  transaction_item?: TransactionItemResponse;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class CreateTransactionRequest {
  @ApiProperty({
    example: 'afe8f509-6f6e-4d64-bdc5-5bd09b6bd87b',
  })
  user_id: string;

  @ApiProperty({
    example: 'afe8f509-6f6e-4d64-bdc5-5bd09b6bd87b',
  })
  address_id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  customer_name: string;

  @ApiProperty({
    example: 'johndoe@gmail.com',
  })
  customer_email: string;

  @ApiProperty({
    example: 'JNE',
  })
  courier: string;

  @ApiProperty({
    example: 'REG',
  })
  shipping_method: string;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(ShoppingCartResponse) }],
    },
  })
  item_details: ShoppingCartResponse[];

  @ApiProperty({
    example: 10000,
  })
  shipping_cost: number;
}
