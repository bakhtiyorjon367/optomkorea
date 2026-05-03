export declare class CreateTransactionDto {
    type: 'admin_gave' | 'manager_paid';
    managerId: string;
    amount: number;
    note?: string;
    transactionDate?: string;
}
