/**
 * Smart Category Inferrer based on merchant / narrative text in notifications.
 * Pure deterministic local classification.
 */

export interface SuggestedCategory {
  categoryId: string;
  categoryName: string;
}

export function inferCategoryFromMerchant(
  merchantOrNarrative: string,
  type: 'income' | 'expense'
): SuggestedCategory {
  if (type === 'income') {
    const lower = (merchantOrNarrative || '').toLowerCase();
    if (lower.includes('gaji') || lower.includes('payroll') || lower.includes('salary')) {
      return { categoryId: 'cat-inc-1', categoryName: 'Gaji' };
    }
    if (lower.includes('freelance') || lower.includes('proyek') || lower.includes('project')) {
      return { categoryId: 'cat-inc-2', categoryName: 'Freelance' };
    }
    if (lower.includes('dividen') || lower.includes('bunga') || lower.includes('reksadana') || lower.includes('saham')) {
      return { categoryId: 'cat-inc-4', categoryName: 'Investasi' };
    }
    return { categoryId: 'cat-inc-5', categoryName: 'Pemasukan Lain' };
  }

  const text = (merchantOrNarrative || '').toLowerCase();

  // Food & Beverage
  if (
    /kopi|coffee|cafe|resto|restoran|warung|makan|dapur|bakso|mie|ayam|burger|pizza|mcd|kfc|starbucks|hokben|jco|chatime|roti|teh/i.test(
      text
    )
  ) {
    return { categoryId: 'cat-exp-1', categoryName: 'Makanan & Minuman' };
  }

  // Transportation
  if (
    /gojek|goride|gocar|grab|maxim|pertamina|shell|spbu|bensin|parkir|toll|tol|kai|kereta|mrt|transjakarta/i.test(
      text
    )
  ) {
    return { categoryId: 'cat-exp-2', categoryName: 'Transportasi' };
  }

  // Shopping & Groceries
  if (
    /indomaret|alfamart|shopee|tokopedia|lazada|blibli|superindo|hypermart|transmart|mall|fashion|zara|uniqlo|store|toko/i.test(
      text
    )
  ) {
    return { categoryId: 'cat-exp-3', categoryName: 'Belanja' };
  }

  // Bills & Utilities
  if (
    /pln|listrik|pdam|air|bpjs|telkom|indihome|wifi|pulsa|paket data|pbb|tagihan|asuransi/i.test(
      text
    )
  ) {
    return { categoryId: 'cat-exp-6', categoryName: 'Tagihan & Utilitas' };
  }

  // Health
  if (
    /apotek|kimia farma|k24|rumah sakit|rs |klinik|dokter|halodoc|alodokter|obat|laboratorium/i.test(
      text
    )
  ) {
    return { categoryId: 'cat-exp-7', categoryName: 'Kesehatan' };
  }

  // Education
  if (/kursus|udemy|sekolah|kampus|buku|gramedia|les|biaya kuliah/i.test(text)) {
    return { categoryId: 'cat-exp-4', categoryName: 'Pendidikan' };
  }

  // Entertainment
  if (/bioskop|cinema|xxi|cgv|netflix|spotify|disney|youtube|game|steam|playstation/i.test(text)) {
    return { categoryId: 'cat-exp-5', categoryName: 'Hiburan' };
  }

  return { categoryId: 'cat-exp-8', categoryName: 'Pengeluaran Lain' };
}
