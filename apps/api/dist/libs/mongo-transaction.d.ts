import type { ClientSession, Connection } from 'mongoose';
export declare function mongoSessionOpts(session: ClientSession | undefined): {
    session?: ClientSession;
};
export declare function isReplicaSetTransactionUnsupportedError(e: unknown): boolean;
export declare function runWithReplicaSetTransaction<T>(connection: Connection, fn: (session: ClientSession | undefined) => Promise<T>): Promise<T>;
