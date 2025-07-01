"use server";

import { generateFlowchart } from '@/ai/flows/flowchart';

export async function generateFlowchartAction(description: string): Promise<{ flowchart: string }> {
  console.log('Generating flowchart for:', description);
  
  const result = await generateFlowchart({ description });
  
  return { flowchart: result.flowchart };
}
