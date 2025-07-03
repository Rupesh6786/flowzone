
"use server";

import { adminDb, adminStorage } from '@/lib/firebase-admin';
import type { Comment, Problem } from '@/lib/types';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

// Helper to delete a file from Cloud Storage given its full URL
async function deleteFileFromStorage(fileUrl: string | undefined) {
  if (!fileUrl) return;
  try {
    const url = new URL(fileUrl);
    const bucketName = adminStorage.bucket().name;
    const filePath = decodeURIComponent(url.pathname).replace(`/${bucketName}/`, '');
    
    if (filePath) {
      await adminStorage.bucket().file(filePath).delete();
      console.log(`Successfully deleted old file from Storage: ${filePath}`);
    }
  } catch (e: any) {
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

  await fileUpload.makePublic();
  return fileUpload.publicUrl();
}

export async function createProblemAction(formData: FormData): Promise<{ success: boolean; error?: string; problemId?: string; }> {
    const newProblemRef = adminDb.collection('problems').doc();
    const problemId = newProblemRef.id;

    try {
        const textData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            tags: (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean),
            flowchart: formData.get('flowchartData') as string,
        };

        const codePathsToUpdate: { c?: string; cpp?: string; py?: string } = {};
        const cFile = formData.get('c-code') as File | null;
        const cppFile = formData.get('cpp-code') as File | null;
        const pyFile = formData.get('py-code') as File | null;

        if (cFile && cFile.size > 0) codePathsToUpdate.c = await saveFileToStorageAndGetUrl(cFile, problemId);
        if (cppFile && cppFile.size > 0) codePathsToUpdate.cpp = await saveFileToStorageAndGetUrl(cppFile, problemId);
        if (pyFile && pyFile.size > 0) codePathsToUpdate.py = await saveFileToStorageAndGetUrl(pyFile, problemId);

        const newProblem: Problem = {
            id: problemId,
            ...textData,
            code: codePathsToUpdate,
            stats: { likes: 0, saves: 0 },
            comments: [],
        };
        
        await newProblemRef.set(newProblem);

        revalidatePath('/');
        return { success: true, problemId };

    } catch (e: any) {
        console.error('[createProblemAction Error]', e);
        return { success: false, error: e.message || 'An unknown error occurred during problem creation.' };
    }
}

export async function updateProblemAction(problemId: string, formData: FormData): Promise<{ success: boolean; error?: string; }> {
     if (!problemId) {
        return { success: false, error: "Problem ID is missing." };
    }

    try {
        const problemRef = adminDb.collection('problems').doc(problemId);
        const problemSnap = await problemRef.get();
        if (!problemSnap.exists) {
            throw new Error("Problem not found in the database. It may have been deleted.");
        }
        const oldProblemData = problemSnap.data() as Problem;

        const textData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            tags: (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean),
            flowchart: formData.get('flowchartData') as string,
        };

        const codePathsToUpdate = { ...oldProblemData.code };
        const oldCodePaths = oldProblemData.code || {};
        const cFile = formData.get('c-code') as File | null;
        const cppFile = formData.get('cpp-code') as File | null;
        const pyFile = formData.get('py-code') as File | null;

        if (cFile && cFile.size > 0) {
            await deleteFileFromStorage(oldCodePaths.c);
            codePathsToUpdate.c = await saveFileToStorageAndGetUrl(cFile, problemId);
        }
        if (cppFile && cppFile.size > 0) {
            await deleteFileFromStorage(oldCodePaths.cpp);
            codePathsToUpdate.cpp = await saveFileToStorageAndGetUrl(cppFile, problemId);
        }
        if (pyFile && pyFile.size > 0) {
            await deleteFileFromStorage(oldCodePaths.py);
            codePathsToUpdate.py = await saveFileToStorageAndGetUrl(pyFile, problemId);
        }

        const finalUpdateData = {
            ...textData,
            code: codePathsToUpdate,
        };

        await problemRef.update(finalUpdateData);
        
        revalidatePath('/');
        revalidatePath(`/problem/${problemId}`);

        return { success: true };

    } catch (e: any) {
        console.error('[updateProblemAction Error]', e);
        return { success: false, error: e.message || 'An unknown error occurred during update.' };
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
