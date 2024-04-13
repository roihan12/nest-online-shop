import { WebResponse } from './../model/web.model';
import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  CreateTransactionRequest,
  FilterTransactionRequest,
  TransactionResponse,
  TransactionStatus,
} from 'src/model/transaction.model';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { VariantService } from 'src/variant/variant.service';
import { TransactionValidation } from './transaction.validation';
import { randomUUID } from 'crypto';
import { AddressService } from 'src/address/address.service';
import { TransactionItemsService } from 'src/transaction-items/transaction-items.service';
import { TransactionMidtransPayload } from 'src/model/midtrans.model';
import snap from 'src/common/midtrans.client';
import { Address, Transaction, TransactionsItem } from '@prisma/client';
import * as crypto from 'crypto';
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
        const requestedQuantity = productFromRequest.quantity;
        if (product.stock < requestedQuantity) {
          throw new HttpException(
            `Insufficient stock for product: ${product.name}`,
            400,
          );
        }
        product.quantity = requestedQuantity;
      }
    });

    // Calculate transaction details
    const transaction_id = `TRX-${randomUUID()}`;
    const payload: TransactionMidtransPayload = {
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

    const shippingCost = createRequest.shipping_cost; // Biaya pengiriman
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

    try {
      const data = await snap.createTransaction(payload);

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
        include: {
          address: true,
          transactions_items: {
            where: {
              transaction_id: transaction_id,
            },
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true,
                  variant: true,
                },
              },
            },
          },
        },
      });

      payload.item_details = payload.item_details.filter(
        (item) => item.name !== 'Shipping Cost',
      );

      const newTransactionItem =
        await this.transactionItemService.createTransactionItems(
          payload.item_details,
          newTransaction.id,
        );
      await this.prismaService.$transaction([
        newTransaction,
        newTransactionItem,
      ]);

      const newTransactionItems =
        await this.transactionItemService.getTransactionItemsByTransactionId(
          transaction_id,
        );
      // Mengembalikan nilai dari fungsi async
      return this.toTransactionResponse(
        newTransaction,
        newTransaction.address,
        newTransactionItems,
      );
    } catch (err) {
      console.error(err);
      throw new HttpException('Failed to create transaction', 500);
    }
  }
  async getTransactionByIdWithUserId(
    transaction_id: string,
    userId?: string,
  ): Promise<TransactionResponse> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: transaction_id,
        user_id: userId,
      },
      include: {
        address: true,
        transactions_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                variant: true,
              },
            },
          },
        },
      },
    });
    if (transaction.user_id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to access this transaction',
      );
    }
    const transactionItems =
      await this.transactionItemService.getTransactionItemsByTransactionId(
        transaction.id,
      );
    return this.toTransactionResponse(
      transaction,
      transaction.address,
      transactionItems,
    );
  }

  async getTransactionById(
    transaction_id: string,
  ): Promise<TransactionResponse> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: transaction_id,
      },
      include: {
        address: true,
        transactions_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                variant: true,
              },
            },
          },
        },
      },
    });
    return this.toTransactionResponse(transaction);
  }

  async PaymentNotification(payload: any): Promise<TransactionResponse> {
    const transaction = await this.getTransactionById(payload.order_id);

    if (transaction) {
      const response = await this.updateStatusBasedOnMidtransResponse(
        transaction.id,
        payload,
      );

      return response;
    }
  }

  async getTransactionByUserId(
    user_id: string,
    request: FilterTransactionRequest,
  ): Promise<WebResponse<TransactionResponse[]>> {
    const filterRequest: FilterTransactionRequest =
      this.validationService.validate(TransactionValidation.Filter, request);

    const skip = (filterRequest.page - 1) * filterRequest.size;

    const transactions = await this.prismaService.transaction.findMany({
      where: {
        user_id,
        AND: {
          status: filterRequest.status,
        },
      },
      include: {
        address: true,
        transactions_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                variant: true,
              },
            },
          },
        },
      },
      take: filterRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.transaction.count({
      where: {
        user_id,
        AND: {
          status: filterRequest.status,
        },
      },
    });

    return {
      status: true,
      message: 'Filter Transaction Success',
      data: transactions.map((transaction) =>
        this.toTransactionResponse(transaction),
      ),
      paging: {
        count_item: total,
        current_page: filterRequest.page,
        size: filterRequest.size,
        total_page: Math.ceil(total / filterRequest.size),
      },
    };
  }

  async getTransactionByAdmin(
    request: FilterTransactionRequest,
  ): Promise<WebResponse<TransactionResponse[]>> {
    const filterRequest: FilterTransactionRequest =
      this.validationService.validate(TransactionValidation.Filter, request);

    const skip = (filterRequest.page - 1) * filterRequest.size;

    const transactions = await this.prismaService.transaction.findMany({
      where: {
        AND: {
          status: filterRequest.status,
        },
      },
      include: {
        address: true,
        transactions_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                variant: true,
              },
            },
          },
        },
      },
      take: filterRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.transaction.count({
      where: {
        AND: {
          status: filterRequest.status,
        },
      },
    });

    return {
      status: true,
      message: 'Filter Transaction Success',
      data: transactions.map((transaction) =>
        this.toTransactionResponse(transaction),
      ),
      paging: {
        count_item: total,
        current_page: filterRequest.page,
        size: filterRequest.size,
        total_page: Math.ceil(total / filterRequest.size),
      },
    };
  }

  async updateStatusBasedOnMidtransResponse(
    transaction_id: string,
    data: any,
  ): Promise<any> {
    const hash = crypto
      .createHash('sha512')
      .update(
        `${transaction_id}${data.status_code}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`,
      )
      .digest('hex');

    if (data.signature_key !== hash) {
      throw new HttpException('Invalid signature key', 400);
    }

    let responseData: any = null;
    const transactionStatus: string = data.transaction_status;
    const fraudStatus: string = data.fraud_status;

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK

        const transaction = await this.updateTransactionStatus({
          transaction_id,
          statusTransaction: TransactionStatus.PAID,
          payment_method: data.payment_type,
        });

        responseData = transaction;
      }
    } else if (transactionStatus == 'settlement') {
      // TODO set transaction status on your database to 'success'
      // and response with 200 OK

      const transaction = await this.updateTransactionStatus({
        transaction_id,
        statusTransaction: TransactionStatus.PAID,
        payment_method: data.payment_type,
      });

      responseData = transaction;
    } else if (
      transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire'
    ) {
      // TODO set transaction status on your database to 'failure'
      // and response with 200 OK
      const transaction = await this.updateTransactionStatus({
        transaction_id,
        statusTransaction: TransactionStatus.CANCELED,
        payment_method: data.payment_type,
      });

      responseData = transaction;
    } else if (transactionStatus == 'pending') {
      // TODO set transaction status on your database to 'pending' / waiting payment
      // and response with 200 OK
      const transaction = await this.updateTransactionStatus({
        transaction_id,
        statusTransaction: TransactionStatus.PENDING_PAYMENT,
        payment_method: data.payment_type,
      });

      responseData = transaction;
    }

    return responseData;
  }

  async updateTransactionStatus({
    transaction_id,
    statusTransaction,
    payment_method,
  }: {
    transaction_id: string;
    statusTransaction: TransactionStatus;
    payment_method?: string;
  }): Promise<any> {
    try {
      const updatedTransaction = await this.prismaService.transaction.update({
        where: {
          id: transaction_id,
        },
        data: {
          status: statusTransaction,
          payment_method,
        },
        include: {
          transactions_items: true,
        },
      });

      // Check if status changed to PAID
      if (updatedTransaction.status === TransactionStatus.PAID) {
        // Increment stock_sold for each product in transaction items
        for (const item of updatedTransaction.transactions_items) {
          if (item.product_id) {
            await this.prismaService.product.update({
              where: {
                id: item.product_id,
              },
              data: {
                stock_sold: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      } else if (updatedTransaction.status === TransactionStatus.CANCELED) {
        // Decrement stock_sold for each product in transaction items (rollback if status is CANCEL)
        for (const item of updatedTransaction.transactions_items) {
          if (item.product_id) {
            await this.prismaService.product.update({
              where: {
                id: item.product_id,
              },
              data: {
                stock_sold: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      }

      return updatedTransaction;
    } catch (error) {
      // Tangani kesalahan (error) jika terjadi
      console.error(
        `Failed to update transaction status for ID ${transaction_id}:`,
        error,
      );
      throw new Error(
        `Failed to update transaction status for ID ${transaction_id}`,
      );
    }
  }

  toTransactionResponse(
    data: Transaction,
    address?: Address,
    transactionItem?: TransactionsItem[],
  ): TransactionResponse {
    return {
      id: data.id,
      user_id: data.user_id,
      address_id: data.address_id,
      address: address,
      total_price: data.total_price,
      status: data.status as TransactionStatus,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      courier: data.courier,
      payment_method: data.payment_method,
      shipping_method: data.shipping_method,
      transaction_item: transactionItem,
      snap_token: data.snap_token,
      snap_redirect_url: data.snap_redirect_url,
      shipping_cost: data.shipping_cost,
      updated_at: data.updated_at,
      created_at: data.created_at,
    };
  }
}
