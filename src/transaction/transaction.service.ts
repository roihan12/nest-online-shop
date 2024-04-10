import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateTransactionRequest,
  TransactionResponse,
} from 'src/model/transaction.model';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { VariantService } from 'src/variant/variant.service';
import { TransactionValidation } from './transaction.validation';
import { randomUUID } from 'crypto';
import { AddressService } from 'src/address/address.service';
import { TransactionItemsService } from 'src/transaction-items/transaction-items.service';

@Injectable()
export class TransactionService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private userService: UserService,
    private productService: ProductService,
    private variantService: VariantService,
    private addressService: AddressService,
    private transactionItemService: TransactionItemsService,
  ) {}

  async createTransaction(
    request: CreateTransactionRequest,
  ): Promise<TransactionResponse> {
    this.logger.debug(
      `TransactionService.createTransaction(${JSON.stringify(request)}) `,
    );

    const createRequest: CreateTransactionRequest =
      this.validationService.validate(TransactionValidation.Create, request);

    const user = await this.userService.getProfile(createRequest.user_id);
    const address = await this.addressService.getAddressById(
      user.id,
      createRequest.address_id,
    );
    const productsFromDB = await this.productService.getProductsByIds(
      createRequest.item_details,
    );

    if (productsFromDB.length === 0) {
      throw new Error('Product not found');
    }

    const variantProductFromDB =
      await this.variantService.getProductsAndVariantByIds(
        createRequest.item_details,
      );

    if (variantProductFromDB.length === 0) {
      throw new Error('Variant not found');
    }

    productsFromDB.forEach((product: any) => {
      const productFromRequest = createRequest.item_details.find(
        (item) => item.product_id === product.id,
      );
      if (productFromRequest) {
        product.quantity = productFromRequest.quantity;
      }
    });
    const authString = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);
    // Calculate transaction details
    const transaction_id = `TRX-${randomUUID()}`;
    const payload = {
      transaction_details: {
        order_id: transaction_id,
        gross_amount: 0,
      },
      item_details: [],
      customer_details: {
        first_name: user.full_name,
        email: user.email,
        phone: '',
        billing_address: {
          name: address.name,
          email: user.email,
          phone: address.phone,
          address: address.street,
          city: address.city,
          province: address.province,
          subdistrict: address.subdistrict,
          postal_code: address.postal_code,
          country_code: 'IDN',
        },
      },
      shipping_address: {
        first_name: address.name,
        email: user.email,
        phone: address.phone,
        address: address.street,
        city: address.city,
        province: address.province,
        subdistrict: address.subdistrict,
        postal_code: address.postal_code,
        country_code: 'IDN',
      },
      callbacks: {
        finish: `${process.env.FRONT_END_URL}/order-status?transaction_id=${transaction_id}`,
        error: `${process.env.FRONT_END_URL}/order-status?transaction_id=${transaction_id}`,
        pending: `${process.env.FRONT_END_URL}/order-status?transaction_id=${transaction_id}`,
      },
    };

    // Prepare item details for payload and calculate gross_amount
    productsFromDB.forEach((product) => {
      const productFromRequest = createRequest.item_details.find(
        (item) => item.product_id === product.id,
      );

      if (productFromRequest) {
        let price: number;
        let variantName: string | null;
        // Check if product has a variant_id
        if (productFromRequest.variant_id && product.is_variant) {
          // Jika productFromRequest memiliki variant_id dan product is_variant true,
          // gunakan harga dari variant
          const variantProduct = variantProductFromDB.find(
            (variant) => variant.product_id === product.id,
          );
          if (variantProduct) {
            price = variantProduct.price;
            variantName = variantProduct.name;
          } else {
            throw new Error(`Variant not found for product ID: ${product.id}`);
          }
        } else {
          // Jika tidak, gunakan harga dari product
          price = product.price;
        }

        const itemTotal = productFromRequest.quantity * price;

        payload.item_details.push({
          id: productFromRequest.product_id,
          name: product.name,
          variant_id: productFromRequest.variant_id,
          price,
          quantity: productFromRequest.quantity,
          variantName,
          itemTotal,
        });

        payload.transaction_details.gross_amount += itemTotal;
      }
    });

    const shippingCost = createRequest.shipping_cost; // Biaya pengiriman (contoh: $10)
    const shippingItemTotal = shippingCost; // Hanya satu item shipping dengan harga biaya pengiriman

    payload.item_details.push({
      id: '68228fab-1706-4a6a-b836-9af9888f7e97',
      name: 'Shipping Cost',
      price: shippingCost,
      quantity: 1,
      itemTotal: shippingItemTotal,
    });

    // Hitung kembali gross_amount dengan memperhitungkan biaya pengiriman
    const grossAmount =
      payload.transaction_details.gross_amount + shippingItemTotal;
    payload.transaction_details.gross_amount = grossAmount;
    console.log(payload);

    const response = await fetch(
      `${process.env.MIDTRANS_APP_URL}/snap/v1/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();
    console.log(data);
    if (response.status !== 201) {
      throw new HttpException('Failed to create transaction', 500);
    }
    const newTransaction = await this.prismaService.transaction.create({
      data: {
        id: transaction_id,
        user_id: user.id,
        address_id: address.id,
        total_price: grossAmount,
        status: 'PENDING_PAYMENT',
        customer_email: user.email,
        customer_name: address.name,
        courier: createRequest.courier,
        snap_token: data.token,
        snap_redirect_url: data.redirect_url,
        shipping_cost: shippingCost,
      },
    });

    const newTransactioItem =
      await this.transactionItemService.createTransactionItems(
        payload.item_details,
        newTransaction.id,
      );

    console.log(newTransaction);
    console.log(newTransactioItem);
    return null;
  }
}
