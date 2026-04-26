import { Types } from 'mongoose';

/**
 * Coerces string ids to BSON ObjectId; passes through existing ObjectId.
 * Use for query filters and updates wherever a ref or _id may arrive as a string from HTTP/JWT.
 *
 * After a full DB wipe + re-seed, all ref fields should be consistent ObjectIds; this helper
 * still normalizes string inputs from the API layer.
 */
export const shapeIntoMongoObjectId = (target: unknown): Types.ObjectId => {
  if (typeof target === 'string') {
    return new Types.ObjectId(target);
  }
  if (target instanceof Types.ObjectId) {
    return target;
  }
  return target as Types.ObjectId;
};
