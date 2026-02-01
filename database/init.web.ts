
export interface DatabaseAdapter {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
    getAllAsync<T>(sql: string, params?: any[]): Promise<T[]>;
    getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null>;
    closeAsync(): Promise<void>;
}

class WebDatabaseAdapter implements DatabaseAdapter {
    private data: {
        habits: any[];
        habit_logs: any[];
        categories: any[];
    };
    private nextIds: { habits: number; habit_logs: number; categories: number };

    constructor() {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('habitflow_db') : null;
        if (stored) {
            const parsed = JSON.parse(stored);
            this.data = parsed.data;
            this.nextIds = parsed.nextIds;
        } else {
            this.data = { habits: [], habit_logs: [], categories: [] };
            this.nextIds = { habits: 1, habit_logs: 1, categories: 1 };
            this.initDefaultCategories();
        }
    }

    private initDefaultCategories() {
        const defaults = [
            { id: 1, name: 'Salud', color: '#10B981', icon: 'heart' },
            { id: 2, name: 'Académico', color: '#6366F1', icon: 'school' },
            { id: 3, name: 'Físico', color: '#F59E0B', icon: 'fitness' },
            { id: 4, name: 'Personal', color: '#EC4899', icon: 'person' },
            { id: 5, name: 'Trabajo', color: '#3B82F6', icon: 'briefcase' },
        ];
        this.data.categories = defaults;
        this.nextIds.categories = 6;
        this.save();
    }

    private save() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('habitflow_db', JSON.stringify({
                data: this.data,
                nextIds: this.nextIds,
            }));
        }
    }

    async execAsync(_sql: string): Promise<void> {
        return Promise.resolve();
    }

    async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
        const sqlLower = sql.toLowerCase().trim();

        if (sqlLower.startsWith('insert into habits')) {
            const id = this.nextIds.habits++;
            const habit = {
                id,
                name: params[0],
                category: params[1],
                frequency: params[2],
                color: params[3] || '#6366F1',
                icon: params[4] || 'checkmark-circle',
                created_at: new Date().toISOString(),
            };
            this.data.habits.push(habit);
            this.save();
            return { lastInsertRowId: id, changes: 1 };
        }

        if (sqlLower.startsWith('insert into habit_logs') || sqlLower.includes('on conflict')) {
            const habitId = params[0];
            const date = params[1];
            const status = params[2];
            const newStatus = params.length > 3 ? params[3] : status;

            const existing = this.data.habit_logs.find(
                (l) => l.habit_id === habitId && l.date === date
            );

            if (existing) {
                existing.status = newStatus;
                this.save();
                return { lastInsertRowId: existing.id, changes: 1 };
            } else {
                const id = this.nextIds.habit_logs++;
                this.data.habit_logs.push({ id, habit_id: habitId, date, status: newStatus });
                this.save();
                return { lastInsertRowId: id, changes: 1 };
            }
        }

        if (sqlLower.startsWith('update habits')) {
            const id = params[params.length - 1];
            const habit = this.data.habits.find((h) => h.id === id);
            if (habit) {
                habit.name = params[0];
                habit.category = params[1];
                habit.frequency = params[2];
                habit.color = params[3];
                habit.icon = params[4];
                this.save();
                return { lastInsertRowId: id, changes: 1 };
            }
            return { lastInsertRowId: 0, changes: 0 };
        }

        if (sqlLower.startsWith('delete from habits')) {
            const id = params[0];
            const index = this.data.habits.findIndex((h) => h.id === id);
            if (index !== -1) {
                this.data.habits.splice(index, 1);
                this.data.habit_logs = this.data.habit_logs.filter((l) => l.habit_id !== id);
                this.save();
                return { lastInsertRowId: 0, changes: 1 };
            }
            return { lastInsertRowId: 0, changes: 0 };
        }

        if (sqlLower.startsWith('delete from habit_logs') && params.length === 0) {
            const count = this.data.habit_logs.length;
            this.data.habit_logs = [];
            this.save();
            return { lastInsertRowId: 0, changes: count };
        }

        if (sqlLower.startsWith('insert into categories')) {
            const id = this.nextIds.categories++;
            this.data.categories.push({
                id,
                name: params[0],
                color: params[1],
                icon: params[2],
            });
            this.save();
            return { lastInsertRowId: id, changes: 1 };
        }

        if (sqlLower.startsWith('delete from categories')) {
            const id = params[0];
            const index = this.data.categories.findIndex((c) => c.id === id);
            if (index !== -1) {
                this.data.categories.splice(index, 1);
                this.save();
                return { lastInsertRowId: 0, changes: 1 };
            }
            return { lastInsertRowId: 0, changes: 0 };
        }

        return { lastInsertRowId: 0, changes: 0 };
    }

    async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
        const sqlLower = sql.toLowerCase().trim();

        if (sqlLower.includes('from habits') && sqlLower.includes('left join')) {
            const date = params[0];
            const dayPattern = params[1];
            const dayMatch = dayPattern.match(/\d/);
            const day = dayMatch ? dayMatch[0] : '1';

            return this.data.habits
                .filter((h) => h.frequency.includes(day))
                .map((h) => {
                    const log = this.data.habit_logs.find(
                        (l) => l.habit_id === h.id && l.date === date
                    );
                    return {
                        ...h,
                        status: log ? log.status : 0,
                        log_id: log ? log.id : null,
                    };
                }) as T[];
        }

        if (sqlLower.includes('from habits') && sqlLower.includes('where frequency')) {
            const dayPattern = params[0];
            const dayMatch = dayPattern.match(/\d/);
            const day = dayMatch ? dayMatch[0] : '1';
            return this.data.habits.filter((h) => h.frequency.includes(day)) as T[];
        }

        if (sqlLower.includes('from habits') && !sqlLower.includes('where')) {
            return this.data.habits as T[];
        }

        if (sqlLower.includes('from categories')) {
            return this.data.categories as T[];
        }

        if (sqlLower.includes('with date_range') || sqlLower.includes('daily_habits')) {
            const startDate = params[0];
            const endDate = params[2];
            const result: any[] = [];

            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const dayOfWeek = d.getDay().toString();

                const habitsForDay = this.data.habits.filter((h) =>
                    h.frequency.includes(dayOfWeek)
                );

                if (habitsForDay.length > 0) {
                    const completed = habitsForDay.filter((h) => {
                        const log = this.data.habit_logs.find(
                            (l) => l.habit_id === h.id && l.date === dateStr
                        );
                        return log && log.status === 1;
                    }).length;

                    result.push({
                        date: dateStr,
                        progress: Math.round((completed / habitsForDay.length) * 100),
                    });
                }
            }

            return result as T[];
        }

        return [];
    }

    async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
        const sqlLower = sql.toLowerCase().trim();

        if (sqlLower.includes('from habits where id')) {
            const id = params[0];
            const habit = this.data.habits.find((h) => h.id === id);
            return (habit || null) as T | null;
        }

        if (sqlLower.includes('coalesce(sum')) {
            const date = params[0];
            const dayPattern = params[1];
            const dayMatch = dayPattern.match(/\d/);
            const day = dayMatch ? dayMatch[0] : '1';

            const habitsForDay = this.data.habits.filter((h) =>
                h.frequency.includes(day)
            );

            const completed = habitsForDay.filter((h) => {
                const log = this.data.habit_logs.find(
                    (l) => l.habit_id === h.id && l.date === date
                );
                return log && log.status === 1;
            }).length;

            return { completed, total: habitsForDay.length } as T;
        }

        return null;
    }

    async closeAsync(): Promise<void> {
        return Promise.resolve();
    }
}

let db: DatabaseAdapter | null = null;

export async function getDatabase(): Promise<DatabaseAdapter> {
    if (db) return db;
    db = new WebDatabaseAdapter();
    return db;
}

export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.closeAsync();
        db = null;
    }
}
