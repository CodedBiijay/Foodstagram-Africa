import { RecipeData } from '../types';

const DB_NAME = 'FoodstagramDB';
const DB_VERSION = 1;
const STORE_NAME = 'recipes';

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
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveRecipeToDB = async (recipe: RecipeData, userId?: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      // Ensure ID exists
      const itemToSave = { 
        ...recipe, 
        id: recipe.id || Date.now().toString(),
        userId: userId 
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
       const transaction = db.transaction(STORE_NAME, 'readonly');
       const store = transaction.objectStore(STORE_NAME);
       const request = store.getAll();
       
       request.onsuccess = () => {
           let results = request.result as (RecipeData & { userId?: string })[];
           
           if (userId) {
             results = results.filter(r => r.userId === userId);
           }
           
           // Return most recently added (by timestamp id) first
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
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error deleting from DB:", error);
    throw error;
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
          // Check if already exists to avoid duplicates or just overwrite
          await saveRecipeToDB(recipe);
        }
      }
      localStorage.removeItem('foodstagram_saved_recipes');
    }
  } catch (e) {
    console.error("Migration failed:", e);
  }
};