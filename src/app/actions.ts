
"use server";

import type { Comment } from '@/lib/types';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';

type CodePaths = {
    c?: string;
    cpp?: string;
    py?: string;
};

// Helper function to save a file and return its public path
async function saveFileToPublic(file: File, problemId: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dirPath = path.join(process.cwd(), 'public', 'code', problemId);
  const filePath = path.join(dirPath, file.name);

  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, buffer);
  console.log(`Successfully saved file to: ${filePath}`);
  return `/code/${problemId}/${file.name}`;
}

// Helper function to delete a file from the public directory
async function deleteFileFromPublic(fileUrl: string | undefined) {
    if (!fileUrl) return;
    try {
        const filePath = path.join(process.cwd(), 'public', fileUrl);
        await fs.unlink(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
    } catch (e: any) {
        if (e.code !== 'ENOENT') { // Don't throw an error if file doesn't exist
            console.warn(`Could not delete file at ${fileUrl}:`, e.message);
        }
    }
}

export async function uploadCodeFilesAction(
    formData: FormData, 
    problemId: string, 
    oldCode: CodePaths = {}
): Promise<{ success: boolean; error?: string; codePaths: CodePaths }> {
    if (!problemId) {
        return { success: false, error: "Problem ID is missing.", codePaths: oldCode };
    }
    console.log(`[uploadCodeFilesAction] Starting for problem ID: ${problemId}`);
    
    const cFile = formData.get('c-code') as File | null;
    const cppFile = formData.get('cpp-code') as File | null;
    const pyFile = formData.get('py-code') as File | null;

    const newCodePaths: CodePaths = { ...oldCode };

    try {
        if (cFile && cFile.size > 0) {
            await deleteFileFromPublic(oldCode.c);
            newCodePaths.c = await saveFileToPublic(cFile, problemId);
        }
        if (cppFile && cppFile.size > 0) {
            await deleteFileFromPublic(oldCode.cpp);
            newCodePaths.cpp = await saveFileToPublic(cppFile, problemId);
        }
        if (pyFile && pyFile.size > 0) {
            await deleteFileFromPublic(oldCode.py);
            newCodePaths.py = await saveFileToPublic(pyFile, problemId);
        }

        console.log(`[uploadCodeFilesAction] Successfully processed files for problem ${problemId}.`);
        revalidatePath('/');
        revalidatePath(`/problem/${problemId}`);
        return { success: true, codePaths: newCodePaths };
        
    } catch (e: any) {
        console.error(`[uploadCodeFilesAction Error] Failed during file processing for problem ${problemId}:`, e);
        return { success: false, error: e.message || 'An unknown error occurred during file upload.', codePaths: oldCode };
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
