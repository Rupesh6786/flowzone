
"use server";

import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import type { Comment, Problem } from '@/lib/types';
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to upload a file to the local public directory
async function uploadFile(file: File | null, problemId: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  
  const directoryPath = path.join(process.cwd(), 'public', 'code', problemId);
  await fs.mkdir(directoryPath, { recursive: true });

  const filePath = path.join(directoryPath, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Return the public URL path
  return `/code/${problemId}/${file.name}`;
};

export async function createProblemAction(formData: FormData): Promise<{ success: boolean; error?: string; problemId?: string }> {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tagsValue = formData.get('tags') as string | null;
    const tags = tagsValue ? tagsValue.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    const flowchart = formData.get('flowchart') as string;

    const cFile = formData.get('c-code') as File | null;
    const cppFile = formData.get('cpp-code') as File | null;
    const pyFile = formData.get('py-code') as File | null;

    if (!title || !description) {
        return { success: false, error: 'Title and description are required.' };
    }

    const newProblemRef = doc(collection(db, 'problems'));
    const problemId = newProblemRef.id;

    const codePaths: { c?: string; cpp?: string; py?: string } = {};

    const cPath = await uploadFile(cFile, problemId);
    if(cPath) codePaths.c = cPath;

    const cppPath = await uploadFile(cppFile, problemId);
    if(cppPath) codePaths.cpp = cppPath;

    const pyPath = await uploadFile(pyFile, problemId);
    if(pyPath) codePaths.py = pyPath;

    const newProblem: Problem = {
      id: problemId,
      title,
      description,
      tags,
      flowchart,
      code: codePaths,
      stats: { likes: 0, saves: 0 },
      comments: [],
    };
    
    await setDoc(doc(db, 'problems', problemId), newProblem);

    revalidatePath('/');
    revalidatePath(`/problem/${problemId}`);

    return { success: true, problemId };
  } catch (error: any) {
    console.error('Error creating problem:', error);
    return { success: false, error: error.message };
  }
}

export async function uploadFilesAction(problemId: string, formData: FormData): Promise<{ success: boolean; error?: string; codePaths?: { c?: string; cpp?: string; py?: string; } }> {
  try {
    if (!problemId) {
      return { success: false, error: "Problem ID is required for uploads." };
    }
    
    // Fetch existing problem data to get old file paths for deletion
    const problemRef = adminDb.collection('problems').doc(problemId);
    const problemSnap = await problemRef.get();
    if (!problemSnap.exists) {
        return { success: false, error: "Problem not found during file update." };
    }
    const oldProblemData = problemSnap.data() as Problem;

    const cFile = formData.get('c-code') as File | null;
    const cppFile = formData.get('cpp-code') as File | null;
    const pyFile = formData.get('py-code') as File | null;
    
    // Helper to delete old files
    const deleteOldFile = async (filePath: string | undefined) => {
        if (!filePath) return;
        try {
            await fs.unlink(path.join(process.cwd(), 'public', filePath));
        } catch (e: any) {
            // It's okay if the file doesn't exist, so we only log other errors
            if (e.code !== 'ENOENT') {
                console.warn(`Could not delete old file: ${filePath}`, e);
            }
        }
    };

    // Delete old files if new ones are being uploaded
    if (cFile?.size) await deleteOldFile(oldProblemData.code.c);
    if (cppFile?.size) await deleteOldFile(oldProblemData.code.cpp);
    if (pyFile?.size) await deleteOldFile(oldProblemData.code.py);

    // Upload new files
    const newPaths: { c?: string; cpp?: string; py?: string } = {};

    const cPath = await uploadFile(cFile, problemId);
    if (cPath) newPaths.c = cPath;

    const cppPath = await uploadFile(cppFile, problemId);
    if (cppPath) newPaths.cpp = cppPath;

    const pyPath = await uploadFile(pyFile, problemId);
    if (pyPath) newPaths.py = pyPath;
    
    return { success: true, codePaths: newPaths };
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return { success: false, error: error.message };
  }
}


export async function addCommentAction(problemId: string, comment: Omit<Comment, 'id' | 'timestamp'>): Promise<{ success: boolean; error?: string }> {
    if (!problemId || !comment.author || !comment.text) {
        return { success: false, error: 'Missing required fields.' };
    }

    try {
        const problemRef = doc(db, 'problems', problemId);
        const newComment: Comment = {
            ...comment,
            id: new Date().getTime().toString(),
            timestamp: new Date().toISOString(),
        };

        await updateDoc(problemRef, {
            comments: arrayUnion(newComment)
        });

        revalidatePath(`/problem/${problemId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error adding comment:', error);
        return { success: false, error: error.message };
    }
}

export async function updateProblemStatsAction(problemId: string, stat: 'likes' | 'saves'): Promise<{ success: boolean; error?: string }> {
    if (!problemId || (stat !== 'likes' && stat !== 'saves')) {
        return { success: false, error: 'Invalid input provided.' };
    }

    try {
        const problemRef = doc(db, 'problems', problemId);
        const problemSnap = await getDoc(problemRef);

        if (!problemSnap.exists()) {
            return { success: false, error: 'Problem not found.' };
        }

        const currentCount = problemSnap.data().stats[stat] || 0;
        const newCount = currentCount + 1;

        await updateDoc(problemRef, {
            [`stats.${stat}`]: newCount,
        });

        revalidatePath(`/problem/${problemId}`);
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating ${stat} count:`, error);
        return { success: false, error: 'Could not update the count. Please try again.' };
    }
}
