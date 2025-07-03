
"use server";

import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import type { Comment, Problem } from '@/lib/types';
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';

// Helper to save a file to the local public directory
async function saveFileAndGetPath(file: File, problemId: string): Promise<string> {
  const directoryPath = path.join(process.cwd(), 'public', 'code', problemId);
  await fs.mkdir(directoryPath, { recursive: true });

  const filePath = path.join(directoryPath, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Return the public URL path
  return `/code/${problemId}/${file.name}`;
};

// Helper to delete a file from the local public directory
async function deleteFile(filePath: string | undefined) {
  if (!filePath) return;
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.unlink(fullPath);
    console.log(`Successfully deleted old file at ${fullPath}`);
  } catch (e: any) {
    // It's okay if the file doesn't exist, so we only log other errors
    if (e.code !== 'ENOENT') {
      console.warn(`Could not delete old file at ${filePath}:`, e);
    }
  }
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

    const newProblemRef = adminDb.collection('problems').doc();
    const problemId = newProblemRef.id;

    const codePaths: { c?: string; cpp?: string; py?: string } = {};

    if (cFile && cFile.size > 0) {
      codePaths.c = await saveFileAndGetPath(cFile, problemId);
    }
    if (cppFile && cppFile.size > 0) {
      codePaths.cpp = await saveFileAndGetPath(cppFile, problemId);
    }
    if (pyFile && pyFile.size > 0) {
      codePaths.py = await saveFileAndGetPath(pyFile, problemId);
    }

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
    
    await newProblemRef.set(newProblem);

    revalidatePath('/');
    revalidatePath(`/problem/${problemId}`);

    return { success: true, problemId };
  } catch (error: any) {
    console.error('[createProblemAction Error]', error);
    return { success: false, error: `Failed to create problem: ${error.message}` };
  }
}

export async function updateProblemAction(problemId: string, formData: FormData): Promise<{ success: boolean; error?: string; }> {
    if (!problemId) {
        return { success: false, error: "Problem ID is missing." };
    }

    const problemRef = adminDb.collection('problems').doc(problemId);
    let oldProblemData: Problem;

    // Step 1: Fetch existing data
    try {
        const problemSnap = await problemRef.get();
        if (!problemSnap.exists) {
            return { success: false, error: "Problem not found. It might have been deleted." };
        }
        oldProblemData = problemSnap.data() as Problem;
    } catch (error: any) {
        console.error('[updateProblemAction DB Fetch Error]', error);
        return { success: false, error: `Failed to fetch existing problem data: ${error.message}` };
    }
    
    // Step 2: Prepare updated data and handle file operations
    const oldCodePaths = oldProblemData.code || {};
    const updatedData: { [key: string]: any } = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        tags: (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean),
        flowchart: formData.get('flowchart') as string,
        code: { ...oldCodePaths }
    };

    const cFile = formData.get('c-code') as File | null;
    const cppFile = formData.get('cpp-code') as File | null;
    const pyFile = formData.get('py-code') as File | null;
    
    try {
        if (cFile && cFile.size > 0) {
            await deleteFile(oldCodePaths.c);
            updatedData.code.c = await saveFileAndGetPath(cFile, problemId);
        }
        if (cppFile && cppFile.size > 0) {
            await deleteFile(oldCodePaths.cpp);
            updatedData.code.cpp = await saveFileAndGetPath(cppFile, problemId);
        }
        if (pyFile && pyFile.size > 0) {
            await deleteFile(oldCodePaths.py);
            updatedData.code.py = await saveFileAndGetPath(pyFile, problemId);
        }
    } catch (fileError: any) {
        console.error('[updateProblemAction File Error]', fileError);
        return { success: false, error: `Failed to process code files: ${fileError.message}` };
    }
    
    // Step 3: Update Firestore
    try {
        await problemRef.update(updatedData);
    } catch (dbError: any) {
        console.error('[updateProblemAction DB Update Error]', dbError);
        // gRPC code 7 is PERMISSION_DENIED
        if (dbError.code === 7 || dbError.code === 'permission-denied') { 
             return { success: false, error: 'Database permission denied. This is likely a Firestore Rules issue.' };
        }
        return { success: false, error: `Failed to update database: ${dbError.message}` };
    }
    
    // Step 4: Revalidate paths
    try {
      revalidatePath('/');
      revalidatePath(`/problem/${problemId}`);
    } catch (revalidateError: any) {
       console.error('[updateProblemAction Revalidate Error]', revalidateError);
       // This is not a critical failure, but good to know about.
       // We can still return success.
    }
    
    return { success: true };
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
