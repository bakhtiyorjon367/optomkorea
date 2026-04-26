import { Schema } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'categories',
  },
);

export default CategorySchema;
