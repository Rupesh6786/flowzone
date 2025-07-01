"use server";

// This is a placeholder for the actual Genkit flow.
// In a real scenario, you would import and call your flow here.
// import { generateFlowchart } from '@/ai/flows/flowchart'; 

const mockFlowchartSuccess = `
graph TD
    A[Start] --> B{Input a, b, c};
    B --> C[Process: sum = a + b + c];
    C --> D[Process: avg = sum / 3];
    D --> E{Output avg};
    E --> F[End];
`;

const mockFlowchartPalindrome = `
graph TD
    A[Start] --> B{Input string S};
    B --> C[Clean S: remove non-alphanumeric & tolower];
    C --> D[Create reversed string R from S];
    D --> E{Is S == R?};
    E -- Yes --> F[Output "Is Palindrome"];
    E -- No --> G[Output "Not a Palindrome"];
    F --> H[End];
    G --> H[End];
`

export async function generateFlowchartAction(description: string): Promise<{ flowchart: string }> {
  console.log('Generating flowchart for:', description);
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real implementation, you would call:
  // const result = await generateFlowchart({ description });
  // return { flowchart: result.flowchart };

  // For now, return a mock result based on keywords
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("error")) {
    throw new Error("AI failed to generate flowchart. Please try a different description.");
  }

  if (lowerDesc.includes("palindrome")) {
    return { flowchart: mockFlowchartPalindrome };
  }
  
  return { flowchart: mockFlowchartSuccess };
}
