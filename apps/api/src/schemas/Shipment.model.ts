import { Schema } from 'mongoose';

const ShipmentSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    quantityTotal: { type: Number, required: true, min: 1 },
    quantityDistributed: { type: Number, default: 0, min: 0 },
    costKrwTotal: { type: Number, default: 0 },
    shippedAt: { type: Date, default: () => new Date() },
    notes: { type: String, default: '' },
  },
  { collection: 'shipments', timestamps: true },
);

export default ShipmentSchema;
