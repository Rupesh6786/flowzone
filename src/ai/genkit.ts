import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// The projectId should be picked up automatically from the environment in Firebase Studio.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});
