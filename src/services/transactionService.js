import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "transactions";

export const transactionService = {
  // Add a new transaction
  async add(transaction) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...transaction,
      date: Timestamp.fromDate(new Date(transaction.date)),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  // Get all transactions ordered by date (newest first)
  async getAll() {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  },

  // Get transactions by type (income/expense) - filtered client-side
  // to avoid needing a composite index in Firestore
  async getByType(type) {
    const all = await this.getAll();
    return all.filter(t => t.type === type);
  },

  // Delete a transaction
  async delete(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  // Get total balance
  async getBalance() {
    const transactions = await this.getAll();
    return transactions.reduce((acc, t) => {
      return t.type === "income" ? acc + t.amount : acc - t.amount;
    }, 0);
  },

  // Get total income
  async getTotalIncome() {
    const transactions = await this.getByType("income");
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  },

  // Get total expenses
  async getTotalExpenses() {
    const transactions = await this.getByType("expense");
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  }
};