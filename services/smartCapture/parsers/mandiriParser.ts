import { RawNotification, ParsedTransactionResult } from '../types';
import { extractIDRAmount, isNonFinancialAlert } from '../amountExtractor';
import { inferCategoryFromMerchant } from '../categoryInference';

export function parseMandiriNotification(raw: RawNotification): ParsedTransactionResult {
  const fullText = `${raw.title} ${raw.body}`;

  if (isNonFinancialAlert(fullText)) {
    return {
      isFinancial: false,
      amount: null,
      type: null,
      categoryId: 'cat-exp-8',
      categoryName: 'Pengeluaran Lain',
      paymentMethod: 'transfer',
      sourceApp: 'Mandiri',
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
      paymentMethod: 'transfer',
      sourceApp: 'Mandiri',
      confidence: 0.2,
    };
  }

  const lower = fullText.toLowerCase();

  if (lower.includes('dana masuk') || lower.includes('menerima') || lower.includes('kredit')) {
    const senderMatch = fullText.match(/dari\s+([A-Za-z0-9\s]+?)(?:\.|$)/i);
    const sender = senderMatch ? senderMatch[1].trim() : 'Transfer Masuk Livin';
    const cat = inferCategoryFromMerchant(sender, 'income');
    return {
      isFinancial: true,
      amount,
      type: 'income',
      merchant: sender,
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      paymentMethod: 'transfer',
      sourceApp: 'Mandiri',
      confidence: 0.95,
    };
  }

  let merchant = 'Transaksi Mandiri';
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
    paymentMethod: isQRIS ? 'qris' : 'transfer',
    sourceApp: 'Mandiri',
    confidence: 0.95,
  };
}
