import { RawNotification, ParsedTransactionResult } from '../types';
import { extractIDRAmount, isNonFinancialAlert } from '../amountExtractor';
import { inferCategoryFromMerchant } from '../categoryInference';

export function parseGopayNotification(raw: RawNotification): ParsedTransactionResult {
  const fullText = `${raw.title} ${raw.body}`;

  if (isNonFinancialAlert(fullText)) {
    return {
      isFinancial: false,
      amount: null,
      type: null,
      categoryId: 'cat-exp-8',
      categoryName: 'Pengeluaran Lain',
      paymentMethod: 'e-wallet',
      sourceApp: 'GoPay',
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
      sourceApp: 'GoPay',
      confidence: 0.2,
      reason: 'Amount not found',
    };
  }

  const lower = fullText.toLowerCase();

  // Income / Topup / Receive
  if (lower.includes('kamu menerima') || lower.includes('top up') || lower.includes('transfer dari')) {
    const senderMatch = fullText.match(/dari\s+([A-Za-z0-9\s]+?)(?:\.|$)/i);
    const sender = senderMatch ? senderMatch[1].trim() : 'GoPay Masuk';
    const cat = inferCategoryFromMerchant(sender, 'income');
    return {
      isFinancial: true,
      amount,
      type: 'income',
      merchant: sender,
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      paymentMethod: 'e-wallet',
      sourceApp: 'GoPay',
      confidence: 0.95,
    };
  }

  // Expense / QRIS / GoFood / Merchant
  let merchant = 'GoPay Merchant';
  const isQRIS = lower.includes('qris');

  const match = fullText.match(/(?:ke|di|bayar)\s+([A-Za-z0-9\s&'-]+?)(?:\s+sebesar|\s+berhasil|\.|$)/i);
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
    sourceApp: 'GoPay',
    confidence: 0.95,
  };
}
