import { RawNotification, ParsedTransactionResult } from '../types';
import { extractIDRAmount, isNonFinancialAlert } from '../amountExtractor';
import { inferCategoryFromMerchant } from '../categoryInference';

export function parseDanaNotification(raw: RawNotification): ParsedTransactionResult {
  const fullText = `${raw.title} ${raw.body}`;

  if (isNonFinancialAlert(fullText)) {
    return {
      isFinancial: false,
      amount: null,
      type: null,
      categoryId: 'cat-exp-8',
      categoryName: 'Pengeluaran Lain',
      paymentMethod: 'e-wallet',
      sourceApp: 'DANA',
      confidence: 0,
      reason: 'Non-financial notification detected',
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
      sourceApp: 'DANA',
      confidence: 0.2,
      reason: 'Amount not found in notification',
    };
  }

  const lower = fullText.toLowerCase();

  // Incoming funds or Refund
  if (
    lower.includes('menerima saldo') ||
    lower.includes('top up berhasil') ||
    lower.includes('transfer masuk') ||
    lower.includes('pengembalian dana') ||
    lower.includes('dikembalikan') ||
    lower.includes('refund')
  ) {
    const senderMatch = fullText.match(/dari\s+([A-Za-z0-9\s]+?)(?:\.|$)/i);
    const sender = senderMatch ? senderMatch[1].trim() : 'DANA Top-up/Transfer';
    const cat = inferCategoryFromMerchant(sender, 'income');

    return {
      isFinancial: true,
      amount,
      type: 'income',
      recipient: sender,
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      paymentMethod: 'e-wallet',
      sourceApp: 'DANA',
      confidence: 0.95,
      merchant: sender,
    };
  }

  // Outgoing / Payments / QRIS
  let merchant = 'DANA Merchant';
  let isQRIS = lower.includes('qris');

  const merchantMatch = fullText.match(/(?:ke|di)\s+([A-Za-z0-9\s&'-]+?)(?:\s+sebesar|\s+telah|\s+berhasil|\.|$)/i);
  if (merchantMatch && merchantMatch[1]) {
    merchant = merchantMatch[1].trim();
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
    sourceApp: 'DANA',
    confidence: 0.95,
  };
}
