
'use server';
/**
 * @fileOverview A flowchart generation AI agent from pseudocode.
 *
 * - generateFlowchart - A function that handles flowchart generation.
 * - FlowchartInput - The input type for the generateFlowchart function.
 * - FlowchartOutput - The return type for the generateFlowchart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlowchartInputSchema = z.object({
    pseudocode: z.string().describe('The pseudocode to be converted into a flowchart.'),
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
    name: 'generateFlowchartFromPseudocodePrompt',
    input: {schema: FlowchartInputSchema},
    output: {schema: FlowchartOutputSchema},
    prompt: `You are an expert at creating Mermaid.js flowcharts from pseudocode.
Your response MUST be a JSON object that strictly adheres to the provided schema.

**CRITICAL RULES FOR VALID MERMAID SYNTAX:**
Your primary goal is to create a flowchart that will not cause a syntax error. Follow these rules without exception.

1.  **NO CODE SYNTAX IN LABELS:**
    -   DON'T use code like \`nums[i]\`, \`i++\`, \`--j\`, or complex expressions with \`==\`. This will break the parser.
    -   DO use descriptive plain English instead.
    -   Example:
        -   BAD: \`B[sum = nums[i] + nums[j]]\`
        -   GOOD: \`B[Calculate sum of values at index i and j]\`
        -   BAD: \`C[i++]\`
        -   GOOD: \`C[Increment i]\`
        -   BAD: \`D{Is sum == target?}\`
        -   GOOD: \`D{Is sum equal to target?}\`

2.  **NO SQUARE BRACKETS IN LABELS:**
    -   DON'T use square brackets \`[\` or \`]\` inside the text of a node.
    -   DO use parentheses \`(\` or \`)\` or just words.
    -   Example:
        -   BAD: \`D[Return [i, j]]\`
        -   GOOD: \`D[Return (i, j)]\`

3.  **ESCAPE QUOTES:**
    -   DON'T use unescaped double quotes (\`"\`) in labels.
    -   DO escape them as \`&quot;\`.
    -   Example:
        -   BAD: \`D[Output "Not Found"]\`
        -   GOOD: \`D[Output &quot;Not Found&quot;]\`

4.  **MERMAID SYNTAX ONLY:**
    -   The 'flowchart' field must contain ONLY raw Mermaid.js syntax. DO NOT wrap it in markdown fences like \`\`\`mermaid ... \`\`\`.

Use the following shapes for a great user experience:
- Start/End: \`A([Start])\`, \`Z([End])\`
- Process/Action: \`B[Initialize sum to 0]\`
- Input/Output: \`C[/Get user input/]\`
- Decision: \`D{Is value greater than 10?}\`
- Loop: \`E{(For each item in list)}\`

Now, create a flowchart for the following pseudocode. Follow all rules strictly.

Pseudocode:
{{{pseudocode}}}
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
        name: 'generateFlowchartFromPseudocodeFlow',
        inputSchema: FlowchartInputSchema,
        outputSchema: FlowchartOutputSchema,
    },
    async (input) => {
        const response = await prompt(input);
        const output = response.output;

        if (!output) {
            const candidate = response.candidates[0];
            const finishReason = candidate?.finishReason;
            let errorMessage = "The AI failed to generate a flowchart. Please try again.";
            if (finishReason === 'SAFETY') {
                errorMessage = "The flowchart could not be generated due to safety filters. Your pseudocode might contain sensitive terms. Please try rephrasing it.";
            } else if (finishReason) {
                 errorMessage = `The AI stopped for an unexpected reason: ${finishReason}. Please try again or simplify your pseudocode.`;
            }
            throw new Error(errorMessage);
        }
        
        const invalidSyntaxRegex = /(\w+\[\w+\]|\+\+|--|==)/;
        if (invalidSyntaxRegex.test(output.flowchart)) {
            console.error("AI generated invalid Mermaid syntax:", output.flowchart);
            throw new Error("The AI generated a flowchart with invalid syntax (like 'nums[i]' or '=='). Please try generating again, or manually correct the pseudocode.");
        }

        return output;
    }
);
