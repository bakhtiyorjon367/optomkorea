import type { ClientSession, Connection } from 'mongoose';

/**
 * Returns Mongoose option bag with `session` only when defined.
 *
 * Args:
 *   session: Active session, or undefined when running without a transaction.
 *
 * Returns:
 *   object: Either `{ session }` or `{}` for standalone MongoDB.
 */
export function mongoSessionOpts(
  session: ClientSession | undefined,
): { session?: ClientSession } {
  return session ? { session } : {};
}

/**
 * Detects MongoDB standalone rejecting multi-document transactions.
 *
 * Args:
 *   e: Caught error from `withTransaction` or a driver operation.
 *
 * Returns:
 *   boolean: True when the server does not support transactions.
 */
export function isReplicaSetTransactionUnsupportedError(e: unknown): boolean {
  const err = e as { code?: number; codeName?: string; message?: string };
  if (err?.code === 20 && err?.codeName === 'IllegalOperation') return true;
  const msg = err?.message ?? '';
  return (
    typeof msg === 'string' &&
    msg.includes('Transaction numbers are only allowed')
  );
}

/**
 * Runs `fn` inside `withTransaction` when the deployment supports it (replica set / mongos).
 * On a standalone `mongod` (common local dev), runs `fn(undefined)` after ending the session.
 *
 * Args:
 *   connection: Mongoose default connection.
 *   fn: Work callback; pass `session` into operations via `mongoSessionOpts(session)`.
 *
 * Returns:
 *   Promise resolving to the callback result.
 */
export async function runWithReplicaSetTransaction<T>(
  connection: Connection,
  fn: (session: ClientSession | undefined) => Promise<T>,
): Promise<T> {
  const session = await connection.startSession();
  let useStandaloneFallback = false;
  try {
    return await session.withTransaction(() => fn(session));
  } catch (err: unknown) {
    if (isReplicaSetTransactionUnsupportedError(err)) {
      useStandaloneFallback = true;
    } else {
      throw err;
    }
  } finally {
    try {
      if (!session.hasEnded) {
        await session.endSession();
      }
    } catch {
      // Reason: driver may already have closed the session on some error paths.
    }
  }
  if (useStandaloneFallback) {
    return await fn(undefined);
  }
  throw new Error('runWithReplicaSetTransaction: unreachable');
}
