import { db } from '../firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { getDepartmentByAge } from './dateUtils';

/**
 * Syncs member departments based on their current age.
 * Returns a summary of changes.
 */
export const syncMemberDepartments = async () => {
  const querySnapshot = await getDocs(collection(db, "members"));
  const batch = writeBatch(db);
  let updatedCount = 0;
  let summary = [];

  querySnapshot.forEach((docSnap) => {
    const member = docSnap.data();
    const suggestedDept = getDepartmentByAge(member.dob);
    
    // Only update if a suggested department exists and is different from current
    if (suggestedDept && member.department !== suggestedDept) {
      batch.update(doc(db, "members", docSnap.id), {
        department: suggestedDept,
        lastSyncAt: new Date().toISOString()
      });
      updatedCount++;
      summary.push(`${member.name}: ${member.department || 'None'} -> ${suggestedDept}`);
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
  }

  return { updatedCount, summary };
};
