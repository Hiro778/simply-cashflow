import { computeNextDueDate } from '../database/repositories/recurringRepository';

describe('Recurring Transactions Schedule Engine', () => {
  test('computeNextDueDate advances daily schedule by 1 day', () => {
    const next = computeNextDueDate('2026-11-01', 'daily');
    expect(next).toBe('2026-11-02');
  });

  test('computeNextDueDate advances weekly schedule by 7 days', () => {
    const next = computeNextDueDate('2026-11-01', 'weekly');
    expect(next).toBe('2026-11-08');
  });

  test('computeNextDueDate advances monthly schedule by 1 month', () => {
    const next = computeNextDueDate('2026-11-05', 'monthly');
    expect(next).toBe('2026-12-05');
  });

  test('computeNextDueDate rolls over across year boundary', () => {
    const nextMonth = computeNextDueDate('2026-12-15', 'monthly');
    expect(nextMonth).toBe('2027-01-15');

    const nextDaily = computeNextDueDate('2026-12-31', 'daily');
    expect(nextDaily).toBe('2027-01-01');
  });

  test('computeNextDueDate advances yearly schedule by 1 year', () => {
    const next = computeNextDueDate('2026-11-20', 'yearly');
    expect(next).toBe('2027-11-20');
  });
});
