import { Schema } from 'mongoose';

const ReceiptSchema = new Schema(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      index: true,
    },
    managerId: {
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
    receivedAt: { type: Date, default: () => new Date() },
  },
  {
    collection: 'receipts',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

ReceiptSchema.index({ shipmentId: 1, managerId: 1 }, { unique: true });

export default ReceiptSchema;
