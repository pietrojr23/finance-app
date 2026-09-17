import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";

const getUserCollection = (userId, collectionName) => {
  return collection(db, "users", userId, collectionName);
};

export const DEFAULT_CATEGORIES = {
  income: ["Aluguel"],
  expense: ["Luz", "Internet", "Seguro carro", "Parcelamento"]
};

export const categoryService = {
  // Get all categories for a user
  async getAll(userId) {
    const q = query(
      getUserCollection(userId, "categories"),
      orderBy("name", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      type: doc.data().type,
      name: doc.data().name
    }));
  },

  // Subscribe to live category changes (real-time sync across devices)
  subscribe(userId, onData, onError) {
    const q = query(
      getUserCollection(userId, "categories"),
      orderBy("name", "asc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        onData(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            type: doc.data().type,
            name: doc.data().name
          }))
        );
      },
      onError
    );
  },

  // Seed default categories on first use, returns the full list
  async seedDefaults(userId) {
    const existing = await this.getAll(userId);
    if (existing.length > 0) return existing;

    const writes = [];
    for (const [type, names] of Object.entries(DEFAULT_CATEGORIES)) {
      for (const name of names) {
        writes.push(addDoc(getUserCollection(userId, "categories"), { type, name }));
      }
    }
    await Promise.all(writes);
    return this.getAll(userId);
  },

  // Add a category (no-op if it already exists for the type), returns the full list
  async add(userId, type, name) {
    const normalized = name.trim();
    if (!normalized) return this.getAll(userId);

    const existing = await this.getAll(userId);
    const hasDuplicate = existing.some(
      c => c.type === type && c.name.toLowerCase() === normalized.toLowerCase()
    );
    if (!hasDuplicate) {
      await addDoc(getUserCollection(userId, "categories"), {
        type,
        name: normalized
      });
    }
    return this.getAll(userId);
  },

  // Delete a category
  async delete(userId, id) {
    await deleteDoc(doc(db, "users", userId, "categories", id));
  }
};