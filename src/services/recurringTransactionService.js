import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "recurringTransactions";

export const recurringTransactionService = {
  // Add a new recurring transaction
  async add(recurringTransaction) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...recurringTransaction,
      startDate: Timestamp.fromDate(new Date(recurringTransaction.startDate)),
      nextDueDate: Timestamp.fromDate(new Date(recurringTransaction.nextDueDate)),
      createdAt: Timestamp.now(),
      isActive: true
    });
    return docRef.id;
  },

  // Get all recurring transactions ordered by next due date
  async getAll() {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("nextDueDate", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      nextDueDate: doc.data().nextDueDate.toDate()
    }));
  },

  // Get only active recurring transactions
  async getActive() {
    const all = await this.getAll();
    return all.filter(t => t.isActive);
  },

  // Delete a recurring transaction
  async delete(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  // Toggle active status
  async toggleActive(id, isActive) {
    await updateDoc(doc(db, COLLECTION_NAME, id), { isActive });
  },

  // Update next due date (after generating a transaction)
  async updateNextDueDate(id, nextDueDate) {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      nextDueDate: Timestamp.fromDate(new Date(nextDueDate))
    });
  },

  // Calculate next due date based on frequency
  calculateNextDueDate(currentDate, frequency) {
    const date = new Date(currentDate);
    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1); // default to monthly
    }
    return date;
  }
};