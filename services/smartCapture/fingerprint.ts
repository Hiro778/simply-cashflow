/**
 * Deterministic fingerprint generator for notifications.
 * Generates an integer/hex hash without external dependencies.
 * Uses a time-window bucket (5-minute bucket) to deduplicate duplicate notification updates.
 */
export function generateNotificationFingerprint(
  packageName: string,
  title: string,
  body: string,
  timestamp: number
): string {
  // Normalize string content
  const cleanPackage = (packageName || '').trim().toLowerCase();
  const cleanTitle = (title || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const cleanBody = (body || '').trim().toLowerCase().replace(/\s+/g, ' ');
  // 5-minute bucket (300,000 ms)
  const timeBucket = Math.floor(timestamp / 300000);

  const raw = `${cleanPackage}|${cleanTitle}|${cleanBody}|${timeBucket}`;

  // Simple, fast 64-bit deterministic hash (djb2 + sdbm combined)
  let h1 = 5381;
  let h2 = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    h1 = ((h1 << 5) + h1) ^ char;
    h2 = char + (h2 << 6) + (h2 << 16) - h2;
  }

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `fp_${hex1}${hex2}`;
}
