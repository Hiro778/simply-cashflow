import { getDatabase } from '../db';
import { Category } from '../schema';

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY type ASC, name ASC;');
}

export async function getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Category>(
    'SELECT * FROM categories WHERE type = ? ORDER BY name ASC;',
    [type]
  );
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?;', [id]);
}

export async function insertCategory(cat: Omit<Category, 'created_at'>): Promise<Category> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO categories (id, name, type, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [cat.id, cat.name, cat.type, cat.icon, cat.color, cat.is_default, now]
  );
  return { ...cat, created_at: now };
}
