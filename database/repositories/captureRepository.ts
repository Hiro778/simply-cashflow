import { getDatabase } from '../db';
import { CapturedNotification, CaptureStatus } from '../schema';
import { insertTransaction } from './transactionRepository';

export async function getAllCaptured(): Promise<CapturedNotification[]> {
  const db = await getDatabase();
  return await db.getAllAsync<CapturedNotification>(
    'SELECT * FROM captured_notifications ORDER BY notification_timestamp DESC;'
  );
}

export async function getPendingReviewCaptured(): Promise<CapturedNotification[]> {
  const db = await getDatabase();
  return await db.getAllAsync<CapturedNotification>(
    "SELECT * FROM captured_notifications WHERE status = 'pending_review' ORDER BY notification_timestamp DESC;"
  );
}

export async function getCapturedByFingerprint(fingerprint: string): Promise<CapturedNotification | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<CapturedNotification>(
    'SELECT * FROM captured_notifications WHERE fingerprint = ?;',
    [fingerprint]
  );
}

export async function insertCapturedNotification(
  item: Omit<CapturedNotification, 'created_at'>
): Promise<CapturedNotification> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT OR IGNORE INTO captured_notifications (
      id, package_name, app_name, title, body, notification_timestamp,
      parsed_amount, parsed_type, parsed_merchant, parsed_category_id,
      parsed_category_name, confidence, fingerprint, status, transaction_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      item.id,
      item.package_name,
      item.app_name,
      item.title || '',
      item.body || '',
      item.notification_timestamp,
      item.parsed_amount !== null && item.parsed_amount !== undefined ? Math.round(item.parsed_amount) : null,
      item.parsed_type || null,
      item.parsed_merchant || '',
      item.parsed_category_id || '',
      item.parsed_category_name || '',
      item.confidence,
      item.fingerprint,
      item.status,
      item.transaction_id || null,
      now,
    ]
  );

  return {
    ...item,
    created_at: now,
  };
}

export async function updateCapturedStatus(
  id: string,
  status: CaptureStatus,
  transactionId?: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE captured_notifications SET status = ?, transaction_id = COALESCE(?, transaction_id) WHERE id = ?;',
    [status, transactionId || null, id]
  );
}

export async function approvePendingCapture(
  captureId: string,
  overrides?: {
    amount?: number;
    type?: 'income' | 'expense';
    categoryId?: string;
    categoryName?: string;
    description?: string;
    date?: string;
  }
): Promise<string | null> {
  const db = await getDatabase();
  const capture = await db.getFirstAsync<CapturedNotification>(
    'SELECT * FROM captured_notifications WHERE id = ?;',
    [captureId]
  );
  if (!capture || !capture.parsed_amount) return null;

  const date = overrides?.date || new Date(capture.notification_timestamp).toISOString().split('T')[0];
  const txId = `tx-cap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const type = overrides?.type || capture.parsed_type || 'expense';
  const amount = overrides?.amount || capture.parsed_amount;
  const categoryId = overrides?.categoryId || capture.parsed_category_id || (type === 'income' ? 'cat-inc-5' : 'cat-exp-8');
  const categoryName = overrides?.categoryName || capture.parsed_category_name || 'Transaksi';
  const desc = overrides?.description || `${capture.app_name}: ${capture.parsed_merchant || capture.title}`;

  await insertTransaction({
    id: txId,
    amount,
    type,
    category_id: categoryId,
    category_name: categoryName,
    description: desc,
    date,
    merchant: capture.parsed_merchant || undefined,
    source: (capture.app_name as any) || 'other',
    payment_method: 'e-wallet',
    reference_id: capture.fingerprint,
  });

  await updateCapturedStatus(captureId, 'auto_saved', txId);
  return txId;
}

export async function clearAllCaptured(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM captured_notifications;');
}
