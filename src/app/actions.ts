
"use server";

import { adminDb, adminStorage } from '@/lib/firebase-admin';
import type { Comment, Problem } from '@/lib/types';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

// Helper to delete a file from Cloud Storage from a full URL
async function deleteFileFromStorage(fileUrl: string | undefined) {
  if (!fileUrl) return;
  try {
    // Firebase Storage URLs have a specific format. We need to extract the path.
    // Example URL: https://storage.googleapis.com/your-bucket-name/code/problem-id/file.c
    const url = new URL(fileUrl);
    const bucketName = adminStorage.bucket().name;
    // The pathname includes a leading slash and the bucket name, which we remove.
    const filePath = decodeURIComponent(url.pathname).replace(`/${bucketName}/`, '');
    
    if (filePath) {
      await adminStorage.bucket().file(filePath).delete();
      console.log(`Successfully deleted old file from Storage: ${filePath}`);
    }
  } catch (e: any) {
    // It's okay if the file doesn't exist (e.g., manual deletion), so we only log other errors
    if (e.code !== 404) {
      console.warn(`Could not delete old file at ${fileUrl}:`, e.message);
    }
  }
}

// Helper to upload a file to Cloud Storage and return its public URL
async function saveFileToStorageAndGetUrl(file: File, problemId: string): Promise<string> {
  const filePath = `code/${problemId}/${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const bucket = adminStorage.bucket();
  const fileUpload = bucket.file(filePath);

  await fileUpload.save(buffer, {
    metadata: {
      contentType: file.type,
    },
  });

  // Make the file public so it can be fetched by the client CodeViewer
  await fileUpload.makePublic();
  
  // Return the public URL, which is a permanent link to the file
  return fileUpload.publicUrl();
}


export async function handleFileUploadsAction(problemId: string, formData: FormData): Promise<{ success: boolean; error?: string; codePaths?: { c?: string; cpp?: string; py?: string; } }> {
  if (!problemId) {
    return { success: false, error: "Problem ID is missing for file upload." };
  }
  
  let oldProblemData: Problem | null = null;
  
  // Fetch existing data to get old file paths for deletion
  try {
    // Use the ADMIN SDK on the server to bypass security rules for this internal operation
    const problemRef = adminDb.collection('problems').doc(problemId);
    const problemSnap = await problemRef.get();
    if (problemSnap.exists) {
        oldProblemData = problemSnap.data() as Problem;
    }
  } catch (error: any) {
     console.warn(`Could not fetch old problem data for cleanup: ${error.message}`);
  }

  const oldCodePaths = oldProblemData?.code || {};
  const newCodePaths: { c?: string; cpp?: string; py?: string } = {};
  
  const cFile = formData.get('c-code') as File | null;
  const cppFile = formData.get('cpp-code') as File | null;
  const pyFile = formData.get('py-code') as File | null;

  try {
    if (cFile && cFile.size > 0) {
      await deleteFileFromStorage(oldCodePaths.c);
      newCodePaths.c = await saveFileToStorageAndGetUrl(cFile, problemId);
    }
    if (cppFile && cppFile.size > 0) {
      await deleteFileFromStorage(oldCodePaths.cpp);
      newCodePaths.cpp = await saveFileToStorageAndGetUrl(cppFile, problemId);
    }
    if (pyFile && pyFile.size > 0) {
      await deleteFileFromStorage(oldCodePaths.py);
      newCodePaths.py = await saveFileToStorageAndGetUrl(pyFile, problemId);
    }

    revalidatePath('/');
    revalidatePath(`/problem/${problemId}`);

    return { success: true, codePaths: newCodePaths };
  } catch (fileError: any) {
      console.error('[handleFileUploadsAction Storage Error]', fileError);
      return { success: false, error: `Failed to process code files for Cloud Storage: ${fileError.message}` };
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
    
    // This action is handled client-side with optimistic updates in ProblemView.tsx
    // to ensure a fast user experience. It uses the client SDK with atomic increments.
    // This server action is no longer used for stats to prevent misuse and keep UI fast.
    return { success: true };
}
