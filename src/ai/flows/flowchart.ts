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

Important: If you need to include quote characters (") inside a node's text, you must escape them as HTML entities, for example, \`&quot;\`.

Use the following shapes to create a clear and understandable flowchart for a better user experience:
- 🔵 Terminator (Start / End): Use a stadium shape for start and end nodes. e.g., \`A([Start])\`, \`Z([End])\`.
- 🔷 Process (Action / Instruction): Use a standard rectangle for actions like calculations or assignments. e.g., \`B[x = 5]\`.
- 🟨 Input/Output: Use a parallelogram for user input or output operations. e.g., \`C[/Read value/]\` or \`D[/Print value/]\`.
- 🔶 Decision: Use a diamond for conditional checks like if/else. e.g., \`E{Is x > 0?}\`.
- ⬛ Predefined Process (Function / Module): Use the subroutine shape for function calls. e.g., \`F[[Call my_function()]]\`.
- 🟥 Loop Limit: Use a hexagon to represent the start and condition of a loop. e.g., \`G{{For i in 1 to 10}}\`.

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
