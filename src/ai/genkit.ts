import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const projectId = 'ac-solution-t0zkx';

export const ai = genkit({
  plugins: [googleAI({ projectId })],
  model: 'googleai/gemini-1.5-flash-latest',
});
