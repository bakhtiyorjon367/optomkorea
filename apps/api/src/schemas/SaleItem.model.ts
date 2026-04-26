import { Schema } from 'mongoose';

const SaleItemSchema = new Schema(
  {
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  {
    collection: 'sale_items',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export default SaleItemSchema;
