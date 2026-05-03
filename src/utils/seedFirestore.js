import { db } from './firebase.js';
import { doc, setDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const initialUsers = [
  { email: 'admin@ricgcw.com', role: 'admin', branch: 'all' },
  { email: 'langma@ricgcw.com', role: 'branch_admin', branch: 'Langma' },
  { email: 'mallam@ricgcw.com', role: 'branch_admin', branch: 'Mallam' },
  { email: 'kokrobitey@ricgcw.com', role: 'branch_admin', branch: 'Kokrobitey' },
  { email: 'kokrobetey@ricgcw.com', role: 'branch_admin', branch: 'Kokrobitey' },
];

export const seedInitialUsers = async () => {
  console.log("Seeding initial users to Firestore...");
  for (const user of initialUsers) {
    try {
      await setDoc(doc(db, 'users', user.email), {
        role: user.role,
        branch: user.branch,
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`User ${user.email} seeded successfully.`);
    } catch (error) {
      console.error(`Error seeding user ${user.email}:`, error);
    }
  }
  console.log("Seeding complete.");
};
