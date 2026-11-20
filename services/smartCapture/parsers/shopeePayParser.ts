import { RawNotification, ParsedTransactionResult } from '../types';
import { extractIDRAmount, isNonFinancialAlert } from '../amountExtractor';
import { inferCategoryFromMerchant } from '../categoryInference';

export function parseShopeePayNotification(raw: RawNotification): ParsedTransactionResult {
  const fullText = `${raw.title} ${raw.body}`;

  if (isNonFinancialAlert(fullText)) {
    return {
      isFinancial: false,
      amount: null,
      type: null,
      categoryId: 'cat-exp-8',
      categoryName: 'Pengeluaran Lain',
      paymentMethod: 'e-wallet',
      sourceApp: 'ShopeePay',
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
      sourceApp: 'ShopeePay',
      confidence: 0.2,
    };
  }

  const lower = fullText.toLowerCase();

  if (lower.includes('terima transfer') || lower.includes('isi saldo berhasil') || lower.includes('top up')) {
    return {
      isFinancial: true,
      amount,
      type: 'income',
      merchant: 'ShopeePay Masuk',
      categoryId: 'cat-inc-5',
      categoryName: 'Pemasukan Lain',
      paymentMethod: 'e-wallet',
      sourceApp: 'ShopeePay',
      confidence: 0.95,
    };
  }

  let merchant = 'ShopeePay Merchant';
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
    paymentMethod: lower.includes('qris') ? 'qris' : 'e-wallet',
    sourceApp: 'ShopeePay',
    confidence: 0.95,
  };
}
