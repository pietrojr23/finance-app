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

export const recurringTransactionService = {
  // Add a new recurring transaction
  async add(userId, recurringTransaction) {
    const docRef = await addDoc(getUserCollection(userId, "recurringTransactions"), {
      ...recurringTransaction,
      startDate: Timestamp.fromDate(new Date(recurringTransaction.startDate)),
      nextDueDate: Timestamp.fromDate(new Date(recurringTransaction.nextDueDate)),
      createdAt: Timestamp.now(),
      isActive: recurringTransaction.isActive ?? true
    });
    return docRef.id;
  },

  // Subscribe to live recurring changes (real-time sync across devices)
  subscribe(userId, onData, onError) {
    const q = query(
      getUserCollection(userId, "recurringTransactions"),
      orderBy("nextDueDate", "asc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        onData(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate.toDate(),
            nextDueDate: doc.data().nextDueDate.toDate()
          }))
        );
      },
      onError
    );
  },

  // Get all recurring transactions ordered by next due date
  async getAll(userId) {
    const q = query(
      getUserCollection(userId, "recurringTransactions"),
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
  async getActive(userId) {
    const all = await this.getAll(userId);
    return all.filter(t => t.isActive);
  },

  // Update an existing recurring transaction
  async update(userId, id, recurringTransaction) {
    await updateDoc(doc(db, "users", userId, "recurringTransactions", id), {
      ...recurringTransaction,
      startDate: Timestamp.fromDate(new Date(recurringTransaction.startDate)),
      nextDueDate: Timestamp.fromDate(new Date(recurringTransaction.nextDueDate)),
      updatedAt: Timestamp.now()
    });
  },

  // Delete a recurring transaction
  async delete(userId, id) {
    await deleteDoc(doc(db, "users", userId, "recurringTransactions", id));
  },

  // Toggle active status
  async toggleActive(userId, id, isActive) {
    await updateDoc(doc(db, "users", userId, "recurringTransactions", id), { isActive });
  },

  // Update next due date (after generating a transaction)
  async updateNextDueDate(userId, id, nextDueDate) {
    await updateDoc(doc(db, "users", userId, "recurringTransactions", id), {
      nextDueDate: Timestamp.fromDate(new Date(nextDueDate))
    });
  },

  // Calculate next due date based on frequency, clamping to the last day
  // of the target month so dates like Jan 31 don't skip a month.
  calculateNextDueDate(currentDate, frequency) {
    const date = new Date(currentDate);
    const originalDay = date.getDate();

    const addMonthsClamped = (months) => {
      const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
      const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      target.setDate(Math.min(originalDay, lastDay));
      return target;
    };

    switch (frequency) {
      case "weekly": {
        date.setDate(date.getDate() + 7);
        return date;
      }
      case "monthly":
        return addMonthsClamped(1);
      case "quarterly":
        return addMonthsClamped(3);
      case "yearly":
        return addMonthsClamped(12);
      default:
        return addMonthsClamped(1);
    }
  }
};