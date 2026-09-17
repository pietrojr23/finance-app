import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

const getUserCollection = (userId, collectionName) => {
  return collection(db, "users", userId, collectionName);
};

export const transactionService = {
  // Add a new transaction
  async add(userId, transaction) {
    const docRef = await addDoc(getUserCollection(userId, "transactions"), {
      ...transaction,
      date: Timestamp.fromDate(new Date(transaction.date)),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  // Subscribe to live transaction changes (real-time sync across devices)
  subscribe(userId, onData, onError) {
    const q = query(
      getUserCollection(userId, "transactions"),
      orderBy("date", "desc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        onData(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate()
          }))
        );
      },
      onError
    );
  },

  // Get all transactions ordered by date (newest first)
  async getAll(userId) {
    const q = query(
      getUserCollection(userId, "transactions"),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  },

  // Update an existing transaction
  async update(userId, id, transaction) {
    await updateDoc(doc(db, "users", userId, "transactions", id), {
      ...transaction,
      date: Timestamp.fromDate(new Date(transaction.date)),
      updatedAt: Timestamp.now()
    });
  },

  // Get transactions by type (income/expense) - filtered client-side
  async getByType(userId, type) {
    const all = await this.getAll(userId);
    return all.filter(t => t.type === type);
  },

  // Delete a transaction
  async delete(userId, id) {
    await deleteDoc(doc(db, "users", userId, "transactions", id));
  },

  // Get total balance (for rent income, deduct IPTU and condominium fees)
  async getBalance(userId) {
    const transactions = await this.getAll(userId);
    return transactions.reduce((acc, t) => {
      if (t.type === "income") {
        const iptu = t.iptu || 0;
        const condominio = t.condominio || 0;
        return acc + t.amount - iptu - condominio;
      }
      return acc - t.amount;
    }, 0);
  },

  // Get total income
  async getTotalIncome(userId) {
    const transactions = await this.getByType(userId, "income");
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  },

  // Get total expenses
  async getTotalExpenses(userId) {
    const transactions = await this.getByType(userId, "expense");
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  }
};