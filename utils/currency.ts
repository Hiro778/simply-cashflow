/**
 * Indonesian Rupiah (IDR) currency formatting & parsing utilities.
 * Pure integer-based calculations to prevent floating-point issues.
 */

export function formatIDR(amount: number, prefix: boolean = true): string {
  if (isNaN(amount) || !isFinite(amount)) return prefix ? 'Rp 0' : '0';
  
  const isNegative = amount < 0;
  const absVal = Math.round(Math.abs(amount));
  
  // Format with dot thousand separator (Indonesian standard)
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  if (prefix) {
    return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}

export function formatIDRCompact(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return 'Rp 0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let result = '';
  if (abs >= 1_000_000_000) {
    result = `${(abs / 1_000_000_000).toFixed(1).replace('.0', '').replace('.', ',')} M`;
  } else if (abs >= 1_000_000) {
    result = `${(abs / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')} jt`;
  } else if (abs >= 1_000) {
    result = `${(abs / 1_000).toFixed(1).replace('.0', '').replace('.', ',')} rb`;
  } else {
    result = abs.toString();
  }

  return isNegative ? `-Rp ${result}` : `Rp ${result}`;
}

export function parseIDR(input: string | number): number {
  if (typeof input === 'number') {
    return Math.round(input);
  }
  if (!input) return 0;
  
  // Strip everything except digits and optional minus
  const cleaned = input.toString().replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}
