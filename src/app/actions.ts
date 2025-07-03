
"use server";

import { adminDb } from '@/lib/firebase-admin';
import type { Comment, Problem } from '@/lib/types';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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


export async function handleFileUploadsAction(problemId: string, formData: FormData): Promise<{ success: boolean; error?: string; codePaths?: { c?: string; cpp?: string; py?: string; } }> {
  if (!problemId) {
    return { success: false, error: "Problem ID is missing for file upload." };
  }
  
  let oldProblemData: Problem | null = null;
  
  // Fetch existing data to get old file paths for deletion
  try {
    const problemRef = adminDb.collection('problems').doc(problemId);
    const problemSnap = await problemRef.get();
    if (problemSnap.exists) {
        oldProblemData = problemSnap.data() as Problem;
    }
  } catch (error: any) {
    // This might happen during creation, which is fine. We only log if it's not a 'not-found' error.
    if (error.code !== 5) { // 5 is gRPC code for NOT_FOUND
        console.warn(`Could not fetch old problem data for cleanup: ${error.message}`);
    }
  }

  const oldCodePaths = oldProblemData?.code || {};
  const newCodePaths: { c?: string; cpp?: string; py?: string } = {};
  
  const cFile = formData.get('c-code') as File | null;
  const cppFile = formData.get('cpp-code') as File | null;
  const pyFile = formData.get('py-code') as File | null;

  try {
    if (cFile && cFile.size > 0) {
      await deleteFile(oldCodePaths.c);
      newCodePaths.c = await saveFileAndGetPath(cFile, problemId);
    }
    if (cppFile && cppFile.size > 0) {
      await deleteFile(oldCodePaths.cpp);
      newCodePaths.cpp = await saveFileAndGetPath(cppFile, problemId);
    }
    if (pyFile && pyFile.size > 0) {
      await deleteFile(oldCodePaths.py);
      newCodePaths.py = await saveFileAndGetPath(pyFile, problemId);
    }

    revalidatePath('/');
    revalidatePath(`/problem/${problemId}`);

    return { success: true, codePaths: newCodePaths };
  } catch (fileError: any) {
      console.error('[handleFileUploadsAction File Error]', fileError);
      return { success: false, error: `Failed to process code files: ${fileError.message}` };
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
    
    // This action can be called by unauthenticated users, so we use the client SDK.
    // The logic is moved to ProblemView.tsx to ensure it runs on the client.
    // This server action is now a placeholder and should not be called directly for stats.
    // The actual implementation is in ProblemView.tsx's handleStatUpdate.
    // To prevent misuse, we'll just return success. In a real app, this would be secured.
    return { success: true };
}
