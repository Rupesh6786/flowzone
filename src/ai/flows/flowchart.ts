'use server';
/**
 * @fileOverview A flowchart generation AI agent.
 *
 * - generateFlowchart - A function that handles flowchart generation.
 * - FlowchartInput - The input type for the generateFlowchart function.
 * - FlowchartOutput - The return type for the generateFlowchart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlowchartInputSchema = z.object({
    description: z.string().describe('The problem description to be converted into a flowchart.'),
});
export type FlowchartInput = z.infer<typeof FlowchartInputSchema>;

const FlowchartOutputSchema = z.object({
    flowchart: z.string().describe('The generated flowchart in Mermaid.js syntax. The flowchart should be a valid Mermaid graph definition.'),
});
export type FlowchartOutput = z.infer<typeof FlowchartOutputSchema>;

export async function generateFlowchart(input: FlowchartInput): Promise<FlowchartOutput> {
    return generateFlowchartFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateFlowchartPrompt',
    input: {schema: FlowchartInputSchema},
    output: {schema: FlowchartOutputSchema},
    prompt: `You are an expert at creating Mermaid.js flowcharts from problem descriptions.
Given the following problem description, create a Mermaid.js flowchart that visually represents the logic.
The flowchart must be valid Mermaid.js syntax and must start with "graph TD" for a top-down graph.

Problem Description:
{{{description}}}
`,
});

const generateFlowchartFlow = ai.defineFlow(
    {
        name: 'generateFlowchartFlow',
        inputSchema: FlowchartInputSchema,
        outputSchema: FlowchartOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        if (!output) {
            throw new Error("The AI failed to generate a flowchart.");
        }
        return output;
    }
);
