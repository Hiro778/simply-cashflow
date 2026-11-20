import { RawNotification, ParsedTransactionResult } from '../types';
import { extractIDRAmount, isNonFinancialAlert } from '../amountExtractor';
import { inferCategoryFromMerchant } from '../categoryInference';

export function parseOvoNotification(raw: RawNotification): ParsedTransactionResult {
  const fullText = `${raw.title} ${raw.body}`;

  if (isNonFinancialAlert(fullText)) {
    return {
      isFinancial: false,
      amount: null,
      type: null,
      categoryId: 'cat-exp-8',
      categoryName: 'Pengeluaran Lain',
      paymentMethod: 'e-wallet',
      sourceApp: 'OVO',
      confidence: 0,
    };
  }

  const amount = extractIDRAmount(fullText);
  if (!amount) {
    return {
      isFinancial: false,
      amount: null,
      type: null,
      categoryId: 'cat-exp-8',
      categoryName: 'Pengeluaran Lain',
      paymentMethod: 'e-wallet',
      sourceApp: 'OVO',
      confidence: 0.2,
    };
  }

  const lower = fullText.toLowerCase();

  // Incoming
  if (lower.includes('menerima transfer') || lower.includes('top up berhasil') || lower.includes('berhasil ditambahkan')) {
    const cat = inferCategoryFromMerchant('OVO Masuk', 'income');
    return {
      isFinancial: true,
      amount,
      type: 'income',
      merchant: 'OVO Masuk',
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      paymentMethod: 'e-wallet',
      sourceApp: 'OVO',
      confidence: 0.95,
    };
  }

  // Expense
  let merchant = 'OVO Merchant';
  const isQRIS = lower.includes('qris');

  const match = fullText.match(/(?:ke|di)\s+([A-Za-z0-9\s&'-]+?)(?:\s+sebesar|\s+berhasil|\.|$)/i);
  if (match && match[1]) {
    merchant = match[1].trim();
  }

  const cat = inferCategoryFromMerchant(merchant, 'expense');

  return {
    isFinancial: true,
    amount,
    type: 'expense',
    merchant,
    categoryId: cat.categoryId,
    categoryName: cat.categoryName,
    paymentMethod: isQRIS ? 'qris' : 'e-wallet',
    sourceApp: 'OVO',
    confidence: 0.95,
  };
}
