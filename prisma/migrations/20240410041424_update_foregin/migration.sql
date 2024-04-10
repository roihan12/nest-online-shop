-- RenameForeignKey
ALTER TABLE "transactions_items" RENAME CONSTRAINT "transactions_items_ibfk_1" TO "transactions_items_transaction_id_fkey";

-- RenameForeignKey
ALTER TABLE "transactions_items" RENAME CONSTRAINT "transactions_items_ibfk_2" TO "transactions_items_product_id_fkey";
