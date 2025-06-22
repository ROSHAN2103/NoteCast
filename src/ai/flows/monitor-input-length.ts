'use server';

/**
 * @fileOverview Monitors the length of the input notes and provides a warning if it exceeds a suitable amount.
 *
 * - monitorInputLength - A function that handles the input length monitoring process.
 * - MonitorInputLengthInput - The input type for the monitorInputLength function.
 * - MonitorInputLengthOutput - The return type for the monitorInputLength function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonitorInputLengthInputSchema = z.object({
  text: z.string().describe('The input notes to be monitored.'),
});
export type MonitorInputLengthInput = z.infer<typeof MonitorInputLengthInputSchema>;

const MonitorInputLengthOutputSchema = z.object({
  isTooLong: z.boolean().describe('Whether the input notes are too long.'),
  warningMessage: z.string().describe('A warning message if the input notes are too long.'),
});
export type MonitorInputLengthOutput = z.infer<typeof MonitorInputLengthOutputSchema>;

export async function monitorInputLength(input: MonitorInputLengthInput): Promise<MonitorInputLengthOutput> {
  return monitorInputLengthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monitorInputLengthPrompt',
  input: {schema: MonitorInputLengthInputSchema},
  output: {schema: MonitorInputLengthOutputSchema},
  prompt: `You are an AI assistant that monitors the length of input notes for an audio generation application.

  If the notes are longer than 500 words, set isTooLong to true and provide a warning message suggesting the user shorten the notes for optimal audio generation quality. Otherwise, set isTooLong to false and provide an empty warning message.

  Input Notes: {{{text}}}`,
});

const monitorInputLengthFlow = ai.defineFlow(
  {
    name: 'monitorInputLengthFlow',
    inputSchema: MonitorInputLengthInputSchema,
    outputSchema: MonitorInputLengthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
