import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Problem } from './types';

export async function getProblems(): Promise<Problem[]> {
  const problemsCol = collection(db, 'problems');
  const problemSnapshot = await getDocs(problemsCol);
  const problemsList = problemSnapshot.docs.map(doc => doc.data() as Problem);
  return problemsList;
}

export async function getProblemById(id: string): Promise<Problem | undefined> {
  const problemRef = doc(db, 'problems', id);
  const problemSnap = await getDoc(problemRef);

  if (problemSnap.exists()) {
    return problemSnap.data() as Problem;
  } else {
    return undefined;
  }
}
