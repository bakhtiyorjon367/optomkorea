import { Schema } from 'mongoose';

const FinanceTransactionSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['admin_gave', 'manager_paid'],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    transactionDate: { type: Date, default: () => new Date() },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    collection: 'finance_transactions',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export default FinanceTransactionSchema;
