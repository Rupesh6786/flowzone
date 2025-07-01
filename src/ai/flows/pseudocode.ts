
'use server';
/**
 * @fileOverview A pseudocode generation AI agent.
 *
 * - generatePseudocode - A function that handles pseudocode generation.
 * - PseudocodeInput - The input type for the generatePseudocode function.
 * - PseudocodeOutput - The return type for the generatePseudocode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PseudocodeInputSchema = z.object({
    description: z.string().describe('The problem description to be converted into pseudocode.'),
});
export type PseudocodeInput = z.infer<typeof PseudocodeInputSchema>;

const PseudocodeOutputSchema = z.object({
    pseudocode: z.string().describe('The generated pseudocode. It should be clear, step-by-step, and easy to understand.'),
});
export type PseudocodeOutput = z.infer<typeof PseudocodeOutputSchema>;

export async function generatePseudocode(input: PseudocodeInput): Promise<PseudocodeOutput> {
    return generatePseudocodeFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generatePseudocodePrompt',
    input: {schema: PseudocodeInputSchema},
    output: {schema: PseudocodeOutputSchema},
    prompt: `You are an expert programmer who excels at writing clear, concise, and language-agnostic pseudocode from a problem description.

The pseudocode should break down the problem into logical steps that are easy for a human to follow and for another AI to convert into a flowchart.

**RULES:**
- Use simple, direct language.
- Start with keywords like START, INPUT, SET, IF, ELSE, WHILE, FOR, OUTPUT, END.
- Indent nested blocks of logic (like inside loops or conditionals).
- Avoid any syntax specific to a programming language (e.g., no '===' or ';'). Use 'is equal to', 'is less than', etc.

**EXAMPLE:**
Problem Description: "Given an array of integers, find the largest number."
{
  "pseudocode": "START\\n  INPUT numbers_array\\n  IF numbers_array is empty THEN\\n    OUTPUT error \"Array is empty\"\\n  ELSE\\n    SET largest_number to first element of numbers_array\\n    FOR each number in numbers_array\\n      IF number is greater than largest_number THEN\\n        SET largest_number to number\\n      END IF\\n    END FOR\\n    OUTPUT largest_number\\n  END IF\\nEND"
}

Now, create pseudocode for the following problem description. Follow all rules strictly.

Problem Description:
{{{description}}}
`,
});

const generatePseudocodeFlow = ai.defineFlow(
    {
        name: 'generatePseudocodeFlow',
        inputSchema: PseudocodeInputSchema,
        outputSchema: PseudocodeOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        if (!output) {
            throw new Error("The AI failed to generate pseudocode.");
        }
        return output;
    }
);
