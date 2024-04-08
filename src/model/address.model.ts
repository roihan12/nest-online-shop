import { ApiProperty } from '@nestjs/swagger';

export class AddressResponse {
  @ApiProperty({
    example: 'cea048cd-3ac9-4877-b380-1fd76ea44d97',
  })
  id: string;

  @ApiProperty({
    example: '3ea3fe23-f427-40ca-85ee-3a700d0a5164',
  })
  user_id: string;

  @ApiProperty({
    example: 'Address 1',
  })
  name: string;

  @ApiProperty({
    example: '085633022288',
  })
  phone: string;

  @ApiProperty({
    example: 'Jl. test example 1',
  })
  street: string;

  @ApiProperty({
    example: 'Bogor',
  })
  city: string;

  @ApiProperty({
    example: 'Jawa Barat',
  })
  province: string;

  @ApiProperty({
    example: 'Indonesia',
  })
  country: string;

  @ApiProperty({
    example: 'kecamatan 1',
  })
  subdistrict: string;

  @ApiProperty({
    example: 'HOME',
  })
  type_name: 'HOME' | 'OFFICE';

  @ApiProperty({
    example: '15570',
  })
  postal_code: string;

  @ApiProperty({
    example: true,
  })
  is_default: boolean;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  created_at?: Date;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  updated_at?: Date;
}

export class CreateAddressRequest {
  @ApiProperty({
    example: 'Address 1',
  })
  name: string;

  @ApiProperty({
    example: '085633022288',
  })
  phone: string;

  @ApiProperty({
    example: 'Jl. test example 1',
  })
  street: string;

  @ApiProperty({
    example: 'Bogor',
  })
  city: string;

  @ApiProperty({
    example: 'Jawa Barat',
  })
  province: string;

  @ApiProperty({
    example: 'Indonesia',
  })
  country: string;

  @ApiProperty({
    example: 'kecamatan 1',
  })
  subdistrict: string;

  @ApiProperty({
    example: 'HOME',
  })
  type_name: 'HOME' | 'OFFICE';

  @ApiProperty({
    example: '15570',
  })
  postal_code: string;

  @ApiProperty({
    example: true,
  })
  is_default: boolean;
}

export class UpdateAddressRequest {
  id: string;
  @ApiProperty({
    example: 'Address 1',
  })
  name: string;

  @ApiProperty({
    example: '085633022288',
  })
  phone: string;

  @ApiProperty({
    example: 'Jl. test example 1',
  })
  street: string;

  @ApiProperty({
    example: 'Bogor',
  })
  city: string;

  @ApiProperty({
    example: 'Jawa Barat',
  })
  province: string;

  @ApiProperty({
    example: 'Indonesia',
  })
  country: string;

  @ApiProperty({
    example: 'kecamatan 1',
  })
  subdistrict: string;

  @ApiProperty({
    example: 'HOME',
  })
  type_name: 'HOME' | 'OFFICE';

  @ApiProperty({
    example: '15570',
  })
  postal_code: string;

  @ApiProperty({
    example: true,
  })
  is_default: boolean;
}
