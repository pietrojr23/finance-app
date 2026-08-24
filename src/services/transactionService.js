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

  // Get transactions by type (income/expense) - filtered client-side
  async getByType(userId, type) {
    const all = await this.getAll(userId);
    return all.filter(t => t.type === type);
  },

  // Delete a transaction
  async delete(userId, id) {
    await deleteDoc(doc(db, "users", userId, "transactions", id));
  },

  // Get total balance
  async getBalance(userId) {
    const transactions = await this.getAll(userId);
    return transactions.reduce((acc, t) => {
      return t.type === "income" ? acc + t.amount : acc - t.amount;
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