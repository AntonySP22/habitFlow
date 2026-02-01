import { getDatabase } from './init';

export interface Habit {
    id: number;
    name: string;
    category: string;
    frequency: number[];
    color: string;
    icon: string;
    created_at: string;
}

export interface HabitLog {
    id: number;
    habit_id: number;
    date: string;
    status: number;
}

export interface HabitWithStatus extends Habit {
    status: number;
    log_id: number | null;
}

export interface Category {
    id: number;
    name: string;
    color: string;
    icon: string;
}

function parseHabit(row: any): Habit {
    return {
        ...row,
        frequency: typeof row.frequency === 'string' ? JSON.parse(row.frequency) : row.frequency,
    };
}

function parseHabitWithStatus(row: any): HabitWithStatus {
    return {
        ...row,
        frequency: typeof row.frequency === 'string' ? JSON.parse(row.frequency) : row.frequency,
    };
}

export async function getAllHabits(): Promise<Habit[]> {
    const db = await getDatabase();
    const result = await db.getAllAsync<any>('SELECT * FROM habits ORDER BY created_at DESC');
    return result.map(parseHabit);
}

export async function getHabitsForDay(dayOfWeek: number): Promise<Habit[]> {
    const db = await getDatabase();
    const result = await db.getAllAsync<any>(
        `SELECT * FROM habits WHERE frequency LIKE ? ORDER BY category, name`,
        [`%${dayOfWeek}%`]
    );
    return result.map(parseHabit);
}

export async function getHabitsWithStatusForDate(date: string, dayOfWeek: number): Promise<HabitWithStatus[]> {
    const db = await getDatabase();
    const result = await db.getAllAsync<any>(
        `SELECT 
      h.*, 
      COALESCE(hl.status, 0) as status,
      hl.id as log_id
    FROM habits h
    LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = ?
    WHERE h.frequency LIKE ?
    ORDER BY h.category, h.name`,
        [date, `%${dayOfWeek}%`]
    );
    return result.map(parseHabitWithStatus);
}

export async function createHabit(
    name: string,
    category: string,
    frequency: number[],
    color: string = '#6366F1',
    icon: string = 'checkmark-circle'
): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
        'INSERT INTO habits (name, category, frequency, color, icon) VALUES (?, ?, ?, ?, ?)',
        [name, category, JSON.stringify(frequency), color, icon]
    );
    return result.lastInsertRowId;
}

export async function updateHabit(
    id: number,
    name: string,
    category: string,
    frequency: number[],
    color: string,
    icon: string
): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        'UPDATE habits SET name = ?, category = ?, frequency = ?, color = ?, icon = ? WHERE id = ?',
        [name, category, JSON.stringify(frequency), color, icon, id]
    );
}

export async function deleteHabit(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

export async function getHabitById(id: number): Promise<Habit | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<any>('SELECT * FROM habits WHERE id = ?', [id]);

    if (!result) return null;
    return parseHabit(result);
}

export async function toggleHabitLog(habitId: number, date: string, currentStatus: number): Promise<void> {
    const db = await getDatabase();
    const newStatus = currentStatus === 1 ? 0 : 1;

    await db.runAsync(
        `INSERT INTO habit_logs (habit_id, date, status) VALUES (?, ?, ?)
     ON CONFLICT(habit_id, date) DO UPDATE SET status = ?`,
        [habitId, date, newStatus, newStatus]
    );
}

export async function getProgressForDateRange(startDate: string, endDate: string): Promise<{ date: string; progress: number }[]> {
    const db = await getDatabase();

    const result = await db.getAllAsync<{ date: string; completed: number; total: number; progress?: number }>(`
    WITH date_range AS (
      SELECT date(?, '+' || (seq - 1) || ' days') as date
      FROM (
        SELECT 1 as seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
        UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
        UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12
        UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16
        UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
        UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
        UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28
        UNION SELECT 29 UNION SELECT 30
      )
      WHERE date(?, '+' || (seq - 1) || ' days') <= ?
    ),
    daily_habits AS (
      SELECT 
        dr.date,
        h.id as habit_id
      FROM date_range dr
      CROSS JOIN habits h
      WHERE h.frequency LIKE '%' || CAST(strftime('%w', dr.date) AS TEXT) || '%'
    )
    SELECT 
      dh.date,
      COALESCE(SUM(CASE WHEN hl.status = 1 THEN 1 ELSE 0 END), 0) as completed,
      COUNT(dh.habit_id) as total
    FROM daily_habits dh
    LEFT JOIN habit_logs hl ON dh.habit_id = hl.habit_id AND dh.date = hl.date
    GROUP BY dh.date
    ORDER BY dh.date
  `, [startDate, startDate, endDate]);

    return result.map(row => ({
        date: row.date,
        progress: row.progress !== undefined ? row.progress : (row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0),
    }));
}

export async function getAllCategories(): Promise<Category[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name');
}

export async function addCategory(name: string, color: string, icon: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
        'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
        [name, color, icon]
    );
    return result.lastInsertRowId;
}

export async function deleteCategory(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}

export async function getDailyProgress(date: string, dayOfWeek: number): Promise<{ completed: number; total: number }> {
    const db = await getDatabase();

    const result = await db.getFirstAsync<{ completed: number; total: number }>(`
    SELECT 
      COALESCE(SUM(CASE WHEN hl.status = 1 THEN 1 ELSE 0 END), 0) as completed,
      COUNT(h.id) as total
    FROM habits h
    LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.date = ?
    WHERE h.frequency LIKE ?
  `, [date, `%${dayOfWeek}%`]);

    return result || { completed: 0, total: 0 };
}
