export class TransactionMidtransPayload {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  item_details: any[]; // Sesuaikan dengan struktur item_details
  customer_details: {
    first_name: string;
    email: string;
    phone: string;
    billing_address: {
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      subdistrict: string;
      postal_code: string;
      country_code: string;
    };
  };
  shipping_address: {
    first_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    subdistrict: string;
    postal_code: string;
    country_code: string;
  };
  callbacks: {
    finish: string;
    error: string;
    pending: string;
  };
}
