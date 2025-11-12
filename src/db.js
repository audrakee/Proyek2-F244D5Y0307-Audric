const DB_NAME = 'storymap-db';
const DB_VERSION = 1;
const STORES = { favorites: 'favorites', pending: 'pending' };

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.favorites)) db.createObjectStore(STORES.favorites, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORES.pending)) db.createObjectStore(STORES.pending, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(storeName, mode = 'readonly') {
  const db = await openDB();
  const t = db.transaction(storeName, mode);
  return { store: t.objectStore(storeName), done: new Promise(res => t.oncomplete = () => res(true)) };
}

export async function saveFavorite(story) { const { store, done } = await tx(STORES.favorites, 'readwrite'); store.put(story); await done; return story; }
export async function getFavorite(id) { const { store } = await tx(STORES.favorites, 'readonly'); return new Promise(res => { const r = store.get(id); r.onsuccess = () => res(r.result || null); }); }
export async function getAllFavorites() { const { store } = await tx(STORES.favorites, 'readonly'); return new Promise(res => { const r = store.getAll(); r.onsuccess = () => res(r.result || []); }); }
export async function deleteFavorite(id) { const { store, done } = await tx(STORES.favorites, 'readwrite'); store.delete(id); await done; return true; }

export async function addPendingUpload(payload) { const { store, done } = await tx(STORES.pending, 'readwrite'); const req = store.add(payload); const id = await new Promise(res => { req.onsuccess = () => res(req.result); }); await done; return id; }
export async function listPendingUploads() { const { store } = await tx(STORES.pending, 'readonly'); return new Promise(res => { const r = store.getAll(); r.onsuccess = () => res(r.result || []); }); }
export async function deletePendingUpload(id) { const { store, done } = await tx(STORES.pending, 'readwrite'); store.delete(id); await done; return true; }
