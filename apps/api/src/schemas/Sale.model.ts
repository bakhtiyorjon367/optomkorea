import { Schema } from 'mongoose';

const SaleSchema = new Schema(
  {
    type: { type: String, required: true, enum: ['cash', 'credit'] },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerName: { type: String, default: '' },
    comment: { type: String, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['paid', 'unpaid'],
      default: 'paid',
    },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0, min: 0 },
  },
  {
    collection: 'sales',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export default SaleSchema;
