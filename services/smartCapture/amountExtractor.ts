/**
 * Amount extractor for Indonesian financial notification text.
 * Handles variations like:
 * - "Rp 25.000"
 * - "Rp25.000,00"
 * - "Rp. 50.000"
 * - "sebesar Rp 100.000"
 * - "IDR 50.000"
 */
export function extractIDRAmount(text: string): number | null {
  if (!text) return null;

  // Regex matches Rp, Rp., IDR followed by optional space and digit groupings
  const match = text.match(/(?:Rp\.?|IDR)\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]+)/i);
  if (!match || !match[1]) return null;

  const raw = match[1];
  // Remove dot thousand separators
  const withoutDots = raw.replace(/\./g, '');
  // Remove decimal comma if present
  const integerPart = withoutDots.split(',')[0];

  const parsed = parseInt(integerPart, 10);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
}

/**
 * Filter to reject non-financial notifications (OTPs, promo, balance notifications, login alerts).
 */
export function isNonFinancialAlert(text: string): boolean {
  const lower = text.toLowerCase();
  const nonFinancialKeywords = [
    'otp',
    'kode rahasia',
    'jangan bagikan kode',
    'promo',
    'diskon',
    'cashback s.d',
    'klaim hadiah',
    'login berhasil',
    'perangkat baru',
    'ganti password',
    'pin anda telah diubah',
    'verifikasi',
    'security alert',
    'peringatan keamanan',
    'cek saldo',
    'info saldo',
    'sisa saldo',
    'sisa saldo anda',
    'sisa limit',
  ];

  return nonFinancialKeywords.some((keyword) => lower.includes(keyword));
}
