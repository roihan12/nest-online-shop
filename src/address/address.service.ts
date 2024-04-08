import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { Address } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from 'src/model/address.model';
import { AddressValidation } from './address.validation';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getAddressById(userId: string, id: string): Promise<AddressResponse> {
    this.logger.debug('AddressService.getAddressById()');

    const address = await this.prismaService.address.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!address) {
      throw new HttpException('Address not found', 404);
    }

    return this.toAddressResponse(address);
  }

  toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      name: address.name,
      city: address.city,
      province: address.province,
      country: address.country,
      subdistrict: address.subdistrict,
      phone: address.phone,
      user_id: address.user_id,
      is_default: address.is_default,
      postal_code: address.postal_code,
      street: address.street,
      type_name: address.type_name,
      created_at: address.created_at,
      updated_at: address.updated_at,
    };
  }
  async createAddress(
    userId: string,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.debug(`AddressService.createAddress(${request}) `);

    const createRequest: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );

    const newAddress = await this.prismaService.address.create({
      data: {
        name: createRequest.name,
        city: createRequest.city,
        province: createRequest.province,
        country: createRequest.country,
        subdistrict: createRequest.subdistrict,
        phone: createRequest.phone,
        user_id: userId,
        is_default: createRequest.is_default,
        postal_code: createRequest.postal_code,
        street: createRequest.street,
        type_name: createRequest.type_name,
      },
    });

    return this.toAddressResponse(newAddress);
  }

  async checkAddressMustExists(
    userId: string,
    addressId: string,
  ): Promise<Address> {
    const address = await this.prismaService.address.findFirst({
      where: {
        user_id: userId,
        id: addressId,
      },
    });

    if (!address) {
      throw new HttpException('Address is not found', 404);
    }

    return address;
  }

  async updateAddress(
    userId: string,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.debug(`AddressService.updateAddress(${request})`);

    const updateRequest: UpdateAddressRequest = this.validationService.validate(
      AddressValidation.UPDATE,
      request,
    );

    let address = await this.checkAddressMustExists(userId, updateRequest.id);

    address = await this.prismaService.address.update({
      where: {
        id: address.id,
        user_id: address.user_id,
      },
      data: updateRequest,
    });

    return this.toAddressResponse(address);
  }

  async remove(userId: string, addressId: string): Promise<AddressResponse> {
    await this.checkAddressMustExists(userId, addressId);

    const address = await this.prismaService.address.delete({
      where: {
        id: addressId,
        user_id: userId,
      },
    });

    return this.toAddressResponse(address);
  }

  async listAddress(userId: string): Promise<AddressResponse[]> {
    const addresses = await this.prismaService.address.findMany({
      where: {
        user_id: userId,
      },
    });
    return addresses.map((address) => this.toAddressResponse(address));
  }
}
