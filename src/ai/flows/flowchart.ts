
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
Your response MUST be a JSON object that strictly adheres to the provided schema.

**CRITICAL RULES FOR VALID SYNTAX:**
1.  **NO CODE SYNTAX IN LABELS:** Inside node text/labels, DO NOT use code syntax like \`nums[i]\`, \`i++\`, \`--j\`, or complex expressions. This will break the parser.
2.  **USE DESCRIPTIVE TEXT:** Instead of code, describe the action in plain English.
    -   GOOD: \`B[value at index i]\`
    -   BAD: \`B[nums[i]]\`
    -   GOOD: \`C[Increment i]\`
    -   BAD: \`C[i++]\`
3.  **NO SQUARE BRACKETS IN LABELS:** Do not use \`[\` or \`]\` inside the text of a node. Use parentheses \`(\` or \`)\` or just words.
    -   GOOD: \`D[Return (found index, current index)]\`
    -   BAD: \`D[Return [i, j]]\`
4.  **ESCAPE QUOTES:** If you must use a double quote character (") inside a label, escape it as \`&quot;\`.
5.  **MERMAID ONLY:** The 'flowchart' field must contain ONLY raw Mermaid.js syntax. DO NOT wrap it in markdown fences like \`\`\`mermaid ... \`\`\`.

**EXAMPLE OF A PERFECT RESPONSE:**
Description: "Given an array, find the sum of all elements."
{
  "flowchart": "graph TD\\n    A([Start]) --> B[/Get array of numbers/];\\n    B --> C[Initialize sum to 0];\\n    C --> D{For each number in the array};\\n    D -- Loop --> E[Add number to sum];\\n    E --> D;\\n    D -- End Loop --> F[/Output sum/];\\n    F --> Z([End]);"
}


Use the following shapes for a great user experience:
- Start/End: \`A([Start])\`
- Process/Action: \`B[Initialize sum to 0]\`
- Input/Output: \`C[/Get user input/]\`
- Decision: \`D{Is value greater than 10?}\`
- Loop: \`E{(For i from 0 to 10)}\`

Now, create a flowchart for the following problem description. Follow all rules strictly.

Problem Description:
{{{description}}}
`,
    config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
    },
});

const generateFlowchartFlow = ai.defineFlow(
    {
        name: 'generateFlowchartFlow',
        inputSchema: FlowchartInputSchema,
        outputSchema: FlowchartOutputSchema,
    },
    async (input) => {
        const response = await prompt(input);
        const output = response.output;

        if (!output) {
            const candidate = response.candidates[0];
            const finishReason = candidate?.finishReason;
            let errorMessage = "The AI failed to generate a flowchart.";
            if (finishReason === 'SAFETY') {
                errorMessage = "The flowchart could not be generated due to safety filters. Try rephrasing the problem description.";
            } else if (finishReason) {
                 errorMessage = `The AI stopped for an unexpected reason: ${finishReason}. Please try again.`;
            }
            throw new Error(errorMessage);
        }
        return output;
    }
);
