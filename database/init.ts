import * as SQLite from 'expo-sqlite';
import {
    CREATE_CATEGORIES_TABLE,
    CREATE_HABITS_TABLE,
    CREATE_HABIT_LOGS_TABLE,
    INSERT_DEFAULT_CATEGORIES,
} from './schema';

export interface DatabaseAdapter {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
    getAllAsync<T>(sql: string, params?: any[]): Promise<T[]>;
    getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null>;
    closeAsync(): Promise<void>;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<DatabaseAdapter> {
    if (db) return db as unknown as DatabaseAdapter;

    db = await SQLite.openDatabaseAsync('habitflow.db');

    await db.execAsync('PRAGMA foreign_keys = ON;');
    await db.execAsync(CREATE_HABITS_TABLE);
    await db.execAsync(CREATE_HABIT_LOGS_TABLE);
    await db.execAsync(CREATE_CATEGORIES_TABLE);
    await db.execAsync(INSERT_DEFAULT_CATEGORIES);

    return db as unknown as DatabaseAdapter;
}

export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.closeAsync();
        db = null;
    }
}
