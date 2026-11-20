import { parseRawNotification } from '../services/smartCapture/parserEngine';
import { generateNotificationFingerprint } from '../services/smartCapture/fingerprint';
import { extractIDRAmount, isNonFinancialAlert } from '../services/smartCapture/amountExtractor';
import { RawNotification } from '../services/smartCapture/types';

describe('Smart Capture Deterministic Engine & Parsers', () => {
  const timestamp = 1732100000000;

  test('extractIDRAmount parses multiple Indonesian currency variants', () => {
    expect(extractIDRAmount('Pembayaran Rp25.000 berhasil')).toBe(25000);
    expect(extractIDRAmount('Transfer sebesar Rp 150.000 ke Budi')).toBe(150000);
    expect(extractIDRAmount('Pembayaran QRIS Rp. 35.500 di Kopi Janji Jiwa')).toBe(35500);
    expect(extractIDRAmount('Total transaksi IDR 1.250.000')).toBe(1250000);
    expect(extractIDRAmount('Tidak ada uang di sini')).toBeNull();
  });

  test('isNonFinancialAlert detects OTPs, promos, and login alerts', () => {
    expect(isNonFinancialAlert('KODE OTP Anda adalah 8392. Jangan bagikan.')).toBe(true);
    expect(isNonFinancialAlert('PROMO DANA Kaget! Dapatkan cashback s.d 50%')).toBe(true);
    expect(isNonFinancialAlert('Login berhasil dari perangkat baru Xiaomi')).toBe(true);
    expect(isNonFinancialAlert('Pembayaran Rp50.000 ke Tokopedia berhasil')).toBe(false);
  });

  test('DANA Parser: parses QRIS and Merchant payment', () => {
    const raw: RawNotification = {
      id: 'dana-1',
      packageName: 'id.dana',
      appName: 'DANA',
      title: 'Pembayaran Berhasil',
      body: 'Pembayaran Rp45.000 ke Kopi Kenangan telah berhasil.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(45000);
    expect(parsed.type).toBe('expense');
    expect(parsed.merchant).toBe('Kopi Kenangan');
    expect(parsed.categoryName).toBe('Makanan & Minuman');
    expect(parsed.sourceApp).toBe('DANA');
    expect(parsed.confidence).toBeGreaterThanOrEqual(0.9);
  });

  test('DANA Parser: parses Incoming Transfer / Top-up', () => {
    const raw: RawNotification = {
      id: 'dana-2',
      packageName: 'id.dana',
      appName: 'DANA',
      title: 'Saldo Masuk',
      body: 'Kamu menerima saldo Rp250.000 dari PT Maju Mundur.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(250000);
    expect(parsed.type).toBe('income');
    expect(parsed.sourceApp).toBe('DANA');
  });

  test('GoPay Parser: parses GoFood / Merchant Expense', () => {
    const raw: RawNotification = {
      id: 'gopay-1',
      packageName: 'com.gojek.app',
      appName: 'GoPay',
      title: 'Pembayaran Berhasil',
      body: 'Pembayaran Rp32.000 berhasil ke Warung Nasi Padang.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(32000);
    expect(parsed.type).toBe('expense');
    expect(parsed.merchant).toBe('Warung Nasi Padang');
    expect(parsed.sourceApp).toBe('GoPay');
  });

  test('OVO Parser: parses Merchant Payment', () => {
    const raw: RawNotification = {
      id: 'ovo-1',
      packageName: 'id.ovo',
      appName: 'OVO',
      title: 'Transaksi Berhasil',
      body: 'Pembayaran ke Starbucks sebesar Rp58.000 berhasil.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(58000);
    expect(parsed.type).toBe('expense');
    expect(parsed.merchant).toBe('Starbucks');
    expect(parsed.categoryName).toBe('Makanan & Minuman');
  });

  test('ShopeePay Parser: parses Payment to Minimarket', () => {
    const raw: RawNotification = {
      id: 'sp-1',
      packageName: 'com.shopee.id',
      appName: 'ShopeePay',
      title: 'Pembayaran Berhasil!',
      body: 'Kamu telah membayar Rp72.000 ke Indomaret.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(72000);
    expect(parsed.type).toBe('expense');
    expect(parsed.categoryName).toBe('Belanja');
  });

  test('BCA Parser: parses m-Transfer & QRIS', () => {
    const raw: RawNotification = {
      id: 'bca-1',
      packageName: 'com.bca',
      appName: 'BCA',
      title: 'm-Transfer Berhasil',
      body: 'm-Transfer: BERHASIL transfer ke Toko Buku sebesar Rp150.000',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(150000);
    expect(parsed.type).toBe('expense');
    expect(parsed.sourceApp).toBe('BCA');
  });

  test('BRImo Parser: parses Incoming Transfer', () => {
    const raw: RawNotification = {
      id: 'bri-1',
      packageName: 'id.co.bri.brimo',
      appName: 'BRImo',
      title: 'Dana Masuk',
      body: 'Transfer Masuk Rp1.000.000 dari Ahmad Subarjo.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(1000000);
    expect(parsed.type).toBe('income');
    expect(parsed.sourceApp).toBe('BRI');
  });

  test('Mandiri Livin Parser: parses QRIS payment', () => {
    const raw: RawNotification = {
      id: 'mandiri-1',
      packageName: 'id.bmri.livin',
      appName: 'Mandiri',
      title: 'Pembayaran QRIS Berhasil',
      body: 'Pembayaran QRIS Rp85.000 di Alfamart berhasil.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(85000);
    expect(parsed.type).toBe('expense');
    expect(parsed.sourceApp).toBe('Mandiri');
  });

  test('Rejects non-financial notifications from target apps', () => {
    const raw: RawNotification = {
      id: 'dana-otp',
      packageName: 'id.dana',
      appName: 'DANA',
      title: 'Kode OTP DANA',
      body: 'Jangan bagikan kode 4521 kepada siapapun.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(false);
    expect(parsed.amount).toBeNull();
  });

  test('Rejects general balance inquiries or updates without a transaction verb', () => {
    const raw: RawNotification = {
      id: 'bca-balance-1',
      packageName: 'com.bca',
      appName: 'BCA',
      title: 'Info Saldo Rekening',
      body: 'Sisa saldo efektif rekening Anda adalah Rp 5.430.000.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    // Info saldo is a balance update alert, not a transaction event
    expect(parsed.isFinancial).toBe(false);
  });

  test('Handles missing amount notifications gracefully without fabricating data', () => {
    const raw: RawNotification = {
      id: 'dana-no-amount',
      packageName: 'id.dana',
      appName: 'DANA',
      title: 'Pembayaran Berhasil',
      body: 'Pembayaran Anda di merchant telah berhasil diproses.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(false);
    expect(parsed.amount).toBeNull();
    expect(parsed.reason).toContain('Amount not found');
  });

  test('Handles unsupported application source safely', () => {
    const raw: RawNotification = {
      id: 'unknown-app-1',
      packageName: 'com.unsupported.finance',
      appName: 'UnknownApp',
      title: 'Notifikasi Baru',
      body: 'Pembayaran Rp50.000 berhasil.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(false);
    expect(parsed.confidence).toBe(0);
    expect(parsed.reason).toContain('Unsupported package');
  });

  test('Parses Incoming Refund (Pengembalian Dana) correctly', () => {
    const raw: RawNotification = {
      id: 'dana-refund-1',
      packageName: 'id.dana',
      appName: 'DANA',
      title: 'Pengembalian Dana Berhasil',
      body: 'Dana Rp75.000 dari Tokopedia telah berhasil dikembalikan ke saldo DANA kamu.',
      timestamp,
    };

    const parsed = parseRawNotification(raw);
    expect(parsed.isFinancial).toBe(true);
    expect(parsed.amount).toBe(75000);
    expect(parsed.type).toBe('income');
  });

  test('Deduplication fingerprint produces matching hash for identical notifications within window', () => {
    const fp1 = generateNotificationFingerprint(
      'id.dana',
      'Pembayaran Berhasil',
      'Pembayaran Rp25.000 ke Kopi Kenangan',
      timestamp
    );

    const fp2 = generateNotificationFingerprint(
      'id.dana',
      'Pembayaran Berhasil',
      'Pembayaran Rp25.000 ke Kopi Kenangan',
      timestamp + 10000 // 10 seconds later (same 5-min bucket)
    );

    expect(fp1).toBe(fp2);

    const fpDifferentAmount = generateNotificationFingerprint(
      'id.dana',
      'Pembayaran Berhasil',
      'Pembayaran Rp50.000 ke Kopi Kenangan',
      timestamp
    );

    expect(fp1).not.toBe(fpDifferentAmount);
  });
});
