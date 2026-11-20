import { PaymentMethod, TransactionSource } from '../../database/schema';

export interface RawNotification {
  id: string;
  packageName: string;
  appName: string;
  title: string;
  body: string;
  subText?: string;
  timestamp: number;
}

export interface ParsedTransactionResult {
  isFinancial: boolean;
  amount: number | null;
  type: 'income' | 'expense' | null;
  merchant?: string;
  recipient?: string;
  categoryId: string;
  categoryName: string;
  paymentMethod: PaymentMethod;
  sourceApp: TransactionSource;
  confidence: number; // 0.0 to 1.0
  reason?: string;
  referenceId?: string;
}

export interface ParserRule {
  targetPackage: string;
  appName: TransactionSource;
  parse: (raw: RawNotification) => ParsedTransactionResult;
}
