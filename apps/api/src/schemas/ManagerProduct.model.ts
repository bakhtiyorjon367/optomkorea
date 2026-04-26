import { Schema } from 'mongoose';

const ManagerProductSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quantityReceived: { type: Number, required: true, min: 0 },
    quantityAvail: { type: Number, required: true, min: 0 },
  },
  {
    collection: 'manager_products',
    timestamps: true,
  },
);

ManagerProductSchema.index({ productId: 1, managerId: 1 }, { unique: true });

export default ManagerProductSchema;
