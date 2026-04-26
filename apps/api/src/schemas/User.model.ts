import { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    telegramId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    password: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'manager', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'users',
  },
);

export default UserSchema;
