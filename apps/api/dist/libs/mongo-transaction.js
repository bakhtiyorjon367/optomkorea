"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoSessionOpts = mongoSessionOpts;
exports.isReplicaSetTransactionUnsupportedError = isReplicaSetTransactionUnsupportedError;
exports.runWithReplicaSetTransaction = runWithReplicaSetTransaction;
function mongoSessionOpts(session) {
    return session ? { session } : {};
}
function isReplicaSetTransactionUnsupportedError(e) {
    const err = e;
    if (err?.code === 20 && err?.codeName === 'IllegalOperation')
        return true;
    const msg = err?.message ?? '';
    return (typeof msg === 'string' &&
        msg.includes('Transaction numbers are only allowed'));
}
async function runWithReplicaSetTransaction(connection, fn) {
    const session = await connection.startSession();
    let useStandaloneFallback = false;
    try {
        return await session.withTransaction(() => fn(session));
    }
    catch (err) {
        if (isReplicaSetTransactionUnsupportedError(err)) {
            useStandaloneFallback = true;
        }
        else {
            throw err;
        }
    }
    finally {
        try {
            if (!session.hasEnded) {
                await session.endSession();
            }
        }
        catch {
        }
    }
    if (useStandaloneFallback) {
        return await fn(undefined);
    }
    throw new Error('runWithReplicaSetTransaction: unreachable');
}
//# sourceMappingURL=mongo-transaction.js.map