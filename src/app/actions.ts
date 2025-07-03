
"use server";

import { adminDb } from '@/lib/firebase-admin';
import type { Comment, Problem } from '@/lib/types';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';

async function saveFileToPublic(file: File, problemId: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dirPath = path.join(process.cwd(), 'public', 'code', problemId);
  const filePath = path.join(dirPath, file.name);

  try {
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, buffer);
    console.log(`Successfully saved file to: ${filePath}`);
    return `/code/${problemId}/${file.name}`;
  } catch (error) {
    console.error(`[saveFileToPublic Error] Failed to save file for problem ${problemId}:`, error);
    throw new Error(`Could not save file: ${file.name}. Check server permissions.`);
  }
}

async function deleteFileFromPublic(fileUrl: string | undefined) {
    if (!fileUrl) return;
    try {
        const filePath = path.join(process.cwd(), 'public', fileUrl);
        await fs.unlink(filePath);
        console.log(`Successfully deleted old file from public: ${filePath}`);
    } catch (e: any) {
        if (e.code !== 'ENOENT') {
            console.warn(`[deleteFileFromPublic Warning] Could not delete old file at ${fileUrl}:`, e.message);
        }
    }
}

export async function createProblemAction(formData: FormData): Promise<{ success: boolean; error?: string; problemId?: string; }> {
    const newProblemRef = adminDb.collection('problems').doc();
    const problemId = newProblemRef.id;
    console.log(`[createProblemAction] Starting for new problem ID: ${problemId}`);

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

        if (cFile && cFile.size > 0) codePathsToUpdate.c = await saveFileToPublic(cFile, problemId);
        if (cppFile && cppFile.size > 0) codePathsToUpdate.cpp = await saveFileToPublic(cppFile, problemId);
        if (pyFile && pyFile.size > 0) codePathsToUpdate.py = await saveFileToPublic(pyFile, problemId);

        const newProblem: Problem = {
            id: problemId,
            ...textData,
            code: codePathsToUpdate,
            stats: { likes: 0, saves: 0 },
            comments: [],
        };
        
        await newProblemRef.set(newProblem);
        console.log(`[createProblemAction] Successfully created problem in Firestore: ${problemId}`);

        revalidatePath('/');
        return { success: true, problemId };

    } catch (e: any) {
        console.error('[createProblemAction Error]', e);
        return { success: false, error: e.message || 'An unknown error occurred during problem creation.' };
    }
}

export async function updateProblemAction(problemId: string, formData: FormData): Promise<{ success: boolean; error?: string; }> {
     if (!problemId) {
        console.error('[updateProblemAction Error] Problem ID is missing.');
        return { success: false, error: "Problem ID is missing." };
    }
    console.log(`[updateProblemAction] Starting for problem ID: ${problemId}`);

    try {
        const problemRef = adminDb.collection('problems').doc(problemId);
        const problemSnap = await problemRef.get();
        if (!problemSnap.exists) {
            throw new Error("Problem not found in the database. It may have been deleted.");
        }
        const oldProblemData = problemSnap.data() as Problem;
        console.log('[updateProblemAction] Fetched old problem data.');


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
            await deleteFileFromPublic(oldCodePaths.c);
            codePathsToUpdate.c = await saveFileToPublic(cFile, problemId);
        }
        if (cppFile && cppFile.size > 0) {
            await deleteFileFromPublic(oldCodePaths.cpp);
            codePathsToUpdate.cpp = await saveFileToPublic(cppFile, problemId);
        }
        if (pyFile && pyFile.size > 0) {
            await deleteFileFromPublic(oldCodePaths.py);
            codePathsToUpdate.py = await saveFileToPublic(pyFile, problemId);
        }
        console.log('[updateProblemAction] Processed file updates.');

        const finalUpdateData = {
            ...textData,
            code: codePathsToUpdate,
        };

        await problemRef.update(finalUpdateData);
        console.log(`[updateProblemAction] Successfully updated problem in Firestore: ${problemId}`);
        
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
