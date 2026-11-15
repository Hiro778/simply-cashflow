import { Transaction, Category, Budget, SavingsGoal, SavingsContribution } from '../database/schema';

export interface BackupData {
  version: string;
  exported_at: string;
  data: {
    transactions: Transaction[];
    categories?: Category[];
    budgets?: Budget[];
    savings_goals?: SavingsGoal[];
    savings_contributions?: SavingsContribution[];
  };
}

export function generateCSV(transactions: Transaction[]): string {
  const header = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description'];
  const rows = transactions.map((t) => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.type}"`,
    `"${t.category_name.replace(/"/g, '""')}"`,
    t.amount.toString(),
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function parseCSV(csvContent: string): Partial<Transaction>[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const results: Partial<Transaction>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted columns with comma
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(line)) !== null && matches.length < 6) {
      let val = match[1] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      matches.push(val);
      if (regex.lastIndex === match.index) regex.lastIndex++;
    }

    if (matches.length >= 5) {
      const id = matches[0];
      const date = matches[1];
      const type = matches[2].toLowerCase() === 'income' ? 'income' : 'expense';
      const category_name = matches[3];
      const amount = parseInt(matches[4], 10) || 0;
      const description = matches[5] || '';

      if (amount > 0 && date) {
        results.push({
          id: id || `csv-${Date.now()}-${i}`,
          date,
          type,
          category_name,
          category_id: type === 'income' ? 'cat-inc-5' : 'cat-exp-8',
          amount,
          description,
        });
      }
    }
  }

  return results;
}

export function validateBackupJSON(parsed: any): BackupData {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Format data tidak valid: bukan objek JSON');
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    throw new Error('Data backup tidak memiliki bagian "data" yang valid');
  }

  const transactions = Array.isArray(parsed.data.transactions)
    ? parsed.data.transactions.filter(
        (t: any) =>
          t &&
          typeof t.id === 'string' &&
          (t.type === 'income' || t.type === 'expense') &&
          typeof t.amount === 'number' &&
          t.amount > 0 &&
          typeof t.date === 'string'
      )
    : [];

  const savings_goals = Array.isArray(parsed.data.savings_goals)
    ? parsed.data.savings_goals.filter(
        (g: any) =>
          g &&
          typeof g.id === 'string' &&
          typeof g.name === 'string' &&
          typeof g.target_amount === 'number' &&
          g.target_amount > 0
      )
    : [];

  const savings_contributions = Array.isArray(parsed.data.savings_contributions)
    ? parsed.data.savings_contributions.filter(
        (c: any) =>
          c &&
          typeof c.id === 'string' &&
          typeof c.goal_id === 'string' &&
          typeof c.amount === 'number' &&
          c.amount > 0
      )
    : [];

  const budgets = Array.isArray(parsed.data.budgets)
    ? parsed.data.budgets.filter(
        (b: any) =>
          b &&
          typeof b.id === 'string' &&
          typeof b.month === 'string' &&
          typeof b.amount === 'number'
      )
    : [];

  return {
    version: parsed.version || '1.0.0',
    exported_at: parsed.exported_at || new Date().toISOString(),
    data: {
      transactions,
      budgets,
      savings_goals,
      savings_contributions,
      categories: parsed.data.categories || [],
    },
  };
}
