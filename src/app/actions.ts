
"use server";

import { generateFlowchart, type FlowchartOutput } from '@/ai/flows/flowchart';
import { generatePseudocode, type PseudocodeOutput } from '@/ai/flows/pseudocode';
import { db } from '@/lib/firebase';
import type { Comment, Problem } from '@/lib/types';
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function generatePseudocodeAction(description: string): Promise<PseudocodeOutput> {
  console.log('Generating pseudocode for:', description);
  const result = await generatePseudocode({ description });
  return result;
}

export async function generateFlowchartFromPseudocodeAction(pseudocode: string): Promise<FlowchartOutput> {
  console.log('Generating flowchart for:', pseudocode);
  const result = await generateFlowchart({ pseudocode });
  return result;
}

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

    const uploadFile = async (file: File | null) => {
      if (!file || file.size === 0) return null;
      
      const uploadDir = path.join(process.cwd(), 'public', 'code', problemId);
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      return `/code/${problemId}/${file.name}`;
    };

    const cPath = await uploadFile(cFile);
    if(cPath) codePaths.c = cPath;

    const cppPath = await uploadFile(cppFile);
    if(cppPath) codePaths.cpp = cppPath;

    const pyPath = await uploadFile(pyFile);
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
    revalidatePath('/create');
    revalidatePath(`/problem/${problemId}`);

    return { success: true, problemId };
  } catch (error: any) {
    console.error('Error creating problem:', error);
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
