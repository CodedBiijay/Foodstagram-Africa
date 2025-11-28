import { RecipeData } from '../types';

const DB_NAME = 'FoodstagramDB';
const DB_VERSION = 2; // Incremented for new store
const STORE_RECIPES = 'recipes';
const STORE_HISTORY = 'history';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_RECIPES)) {
        db.createObjectStore(STORE_RECIPES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
      }
    };
  });
};

// --- FAVORITES (Saved Recipes) ---

export const saveRecipeToDB = async (recipe: RecipeData, userId?: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_RECIPES, 'readwrite');
      const store = transaction.objectStore(STORE_RECIPES);
      const itemToSave = {
        ...recipe,
        id: recipe.id || Date.now().toString(),
        userId: userId,
        savedAt: Date.now()
      };
      const request = store.put(itemToSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error saving to DB:", error);
    throw error;
  }
};

export const getSavedRecipesFromDB = async (userId?: string): Promise<RecipeData[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_RECIPES, 'readonly');
      const store = transaction.objectStore(STORE_RECIPES);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as (RecipeData & { userId?: string })[];
        if (userId) {
          results = results.filter(r => r.userId === userId);
        }
        // Newest first
        resolve(results.reverse());
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error reading from DB:", error);
    return [];
  }
};

export const deleteRecipeFromDB = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_RECIPES, 'readwrite');
      const store = transaction.objectStore(STORE_RECIPES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error deleting from DB:", error);
    throw error;
  }
};

// --- HISTORY (Auto-saved) ---

export const saveToHistoryDB = async (recipe: RecipeData, userId?: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_HISTORY, 'readwrite');
      const store = transaction.objectStore(STORE_HISTORY);
      const itemToSave = {
        ...recipe,
        id: recipe.id || Date.now().toString(),
        userId: userId,
        generatedAt: Date.now()
      };
      const request = store.put(itemToSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error saving to History DB:", error);
    // Don't throw for history, just log
  }
};

export const getHistoryFromDB = async (userId?: string): Promise<RecipeData[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_HISTORY, 'readonly');
      const store = transaction.objectStore(STORE_HISTORY);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as (RecipeData & { userId?: string })[];
        if (userId) {
          results = results.filter(r => r.userId === userId);
        }
        // Newest first, limit to last 20
        const sorted = results.reverse().slice(0, 20);
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error reading from History DB:", error);
    return [];
  }
};

export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    const legacyData = localStorage.getItem('foodstagram_saved_recipes');
    if (legacyData) {
      const parsed = JSON.parse(legacyData) as RecipeData[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("Migrating local storage to IndexedDB...");
        for (const recipe of parsed) {
          await saveRecipeToDB(recipe);
        }
      }
      localStorage.removeItem('foodstagram_saved_recipes');
    }
  } catch (e) {
    console.error("Migration failed:", e);
  }
};