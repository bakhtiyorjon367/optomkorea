import { Schema } from 'mongoose';

const StockTransferSchema = new Schema(
  {
    fromManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed'],
      default: 'pending',
    },
    initiatedAt: { type: Date, default: () => new Date() },
    confirmedAt: { type: Date, default: null },
  },
  {
    collection: 'stock_transfers',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export default StockTransferSchema;
