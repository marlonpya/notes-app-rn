import AsyncStorage from '@react-native-async-storage/async-storage';

const keyFor = (userId: string) => `notes:sync-cursor:${userId}`;

/** Guarda el último server_updated_at descargado, por usuario. */
export class SyncCursorStore {
  get(userId: string): Promise<string | null> {
    return AsyncStorage.getItem(keyFor(userId));
  }

  set(userId: string, cursor: string): Promise<void> {
    return AsyncStorage.setItem(keyFor(userId), cursor);
  }

  clear(userId: string): Promise<void> {
    return AsyncStorage.removeItem(keyFor(userId));
  }
}
