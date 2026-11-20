import { RawNotification, ParsedTransactionResult } from './types';
import { generateNotificationFingerprint } from './fingerprint';
import { parseDanaNotification } from './parsers/danaParser';
import { parseGopayNotification } from './parsers/gopayParser';
import { parseOvoNotification } from './parsers/ovoParser';
import { parseShopeePayNotification } from './parsers/shopeePayParser';
import { parseBcaNotification } from './parsers/bcaParser';
import { parseBrimoNotification } from './parsers/brimoParser';
import { parseMandiriNotification } from './parsers/mandiriParser';
import {
  getCapturedByFingerprint,
  insertCapturedNotification,
  updateCapturedStatus,
} from '../../database/repositories/captureRepository';
import { insertTransaction } from '../../database/repositories/transactionRepository';
import { getSetting } from '../../database/repositories/settingsRepository';

export interface ProcessedCaptureResult {
  fingerprint: string;
  status: 'auto_saved' | 'pending_review' | 'ignored' | 'duplicate';
  transactionId?: string;
  parsed: ParsedTransactionResult;
}

export function parseRawNotification(raw: RawNotification): ParsedTransactionResult {
  const pkg = (raw.packageName || '').toLowerCase();

  if (pkg.startsWith('id.dana')) {
    return parseDanaNotification(raw);
  } else if (pkg.includes('gojek')) {
    return parseGopayNotification(raw);
  } else if (pkg.startsWith('id.ovo')) {
    return parseOvoNotification(raw);
  } else if (pkg.startsWith('com.shopee.id')) {
    return parseShopeePayNotification(raw);
  } else if (pkg.startsWith('com.bca')) {
    return parseBcaNotification(raw);
  } else if (pkg.includes('bri')) {
    return parseBrimoNotification(raw);
  } else if (pkg.includes('bmri') || pkg.includes('livin')) {
    return parseMandiriNotification(raw);
  }

  // Generic fallback parser
  const fullText = `${raw.title} ${raw.body}`;
  return {
    isFinancial: false,
    amount: null,
    type: null,
    categoryId: 'cat-exp-8',
    categoryName: 'Pengeluaran Lain',
    paymentMethod: 'other' as any,
    sourceApp: 'other',
    confidence: 0,
    reason: `Unsupported package: ${raw.packageName}`,
  };
}

/**
 * Executes full pipeline:
 * 1. Deduplication check via SHA/djb2 fingerprint
 * 2. Deterministic parsing
 * 3. Routing to Auto-Save, Pending Review, or Ignore
 * 4. Database persistence
 */
export async function processNotification(raw: RawNotification): Promise<ProcessedCaptureResult> {
  const fingerprint = generateNotificationFingerprint(
    raw.packageName,
    raw.title,
    raw.body,
    raw.timestamp
  );

  // Check if fingerprint already processed
  const existing = await getCapturedByFingerprint(fingerprint);
  if (existing) {
    return {
      fingerprint,
      status: 'duplicate',
      transactionId: existing.transaction_id || undefined,
      parsed: {
        isFinancial: existing.parsed_amount !== null,
        amount: existing.parsed_amount,
        type: existing.parsed_type,
        merchant: existing.parsed_merchant || undefined,
        categoryId: existing.parsed_category_id || 'cat-exp-8',
        categoryName: existing.parsed_category_name || 'Transaksi',
        paymentMethod: 'e-wallet',
        sourceApp: (existing.app_name as any) || 'other',
        confidence: existing.confidence,
      },
    };
  }

  const parsed = parseRawNotification(raw);

  if (!parsed.isFinancial || !parsed.amount || !parsed.type) {
    // Non-financial notification
    await insertCapturedNotification({
      id: raw.id,
      package_name: raw.packageName,
      app_name: raw.appName,
      title: raw.title,
      body: raw.body,
      notification_timestamp: raw.timestamp,
      parsed_amount: null,
      parsed_type: null,
      parsed_merchant: null,
      parsed_category_id: null,
      parsed_category_name: null,
      confidence: parsed.confidence,
      fingerprint,
      status: 'ignored',
      transaction_id: null,
    });

    return {
      fingerprint,
      status: 'ignored',
      parsed,
    };
  }

  // Check user auto-save preference
  const autoSaveSetting = await getSetting('smart_capture_auto_save');
  const isAutoSaveEnabled = autoSaveSetting !== '0'; // default enabled if null or '1'

  const date = new Date(raw.timestamp).toISOString().split('T')[0];
  const time = new Date(raw.timestamp).toTimeString().substring(0, 5);

  if (isAutoSaveEnabled && parsed.confidence >= 0.85) {
    // Auto-Save
    const txId = `tx-cap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await insertTransaction({
      id: txId,
      amount: parsed.amount,
      type: parsed.type,
      category_id: parsed.categoryId,
      category_name: parsed.categoryName,
      description: `${parsed.sourceApp}: ${parsed.merchant || raw.title}`,
      date,
      time,
      merchant: parsed.merchant,
      source: parsed.sourceApp,
      payment_method: parsed.paymentMethod,
      reference_id: fingerprint,
    });

    await insertCapturedNotification({
      id: raw.id,
      package_name: raw.packageName,
      app_name: raw.appName,
      title: raw.title,
      body: raw.body,
      notification_timestamp: raw.timestamp,
      parsed_amount: parsed.amount,
      parsed_type: parsed.type,
      parsed_merchant: parsed.merchant || null,
      parsed_category_id: parsed.categoryId,
      parsed_category_name: parsed.categoryName,
      confidence: parsed.confidence,
      fingerprint,
      status: 'auto_saved',
      transaction_id: txId,
    });

    return {
      fingerprint,
      status: 'auto_saved',
      transactionId: txId,
      parsed,
    };
  } else {
    // Pending Review queue
    await insertCapturedNotification({
      id: raw.id,
      package_name: raw.packageName,
      app_name: raw.appName,
      title: raw.title,
      body: raw.body,
      notification_timestamp: raw.timestamp,
      parsed_amount: parsed.amount,
      parsed_type: parsed.type,
      parsed_merchant: parsed.merchant || null,
      parsed_category_id: parsed.categoryId,
      parsed_category_name: parsed.categoryName,
      confidence: parsed.confidence,
      fingerprint,
      status: 'pending_review',
      transaction_id: null,
    });

    return {
      fingerprint,
      status: 'pending_review',
      parsed,
    };
  }
}
