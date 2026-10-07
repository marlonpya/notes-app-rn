import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'notes.db';

// enableChangeListener permite observar cambios de tablas (nuestro "Flow" de Room).
export const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });

export type AppDatabase = typeof db;
