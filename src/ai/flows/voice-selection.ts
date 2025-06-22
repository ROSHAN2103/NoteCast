'use server';
/**
 * @fileOverview A voice selection AI agent.
 *
 * - selectVoice - A function that handles the voice selection process.
 * - VoiceSelectionInput - The input type for the selectVoice function.
 * - VoiceSelectionOutput - The return type for the selectVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceSelectionInputSchema = z.object({
  tone: z.enum(['friendly', 'professional', 'casual']).describe('The desired tone of the voice.'),
  gender: z.enum(['male', 'female', 'neutral']).optional().describe('The desired gender of the voice.'),
});
export type VoiceSelectionInput = z.infer<typeof VoiceSelectionInputSchema>;

const VoiceSelectionOutputSchema = z.object({
  voiceName: z.string().describe('The name of the selected voice.'),
});
export type VoiceSelectionOutput = z.infer<typeof VoiceSelectionOutputSchema>;

export async function selectVoice(input: VoiceSelectionInput): Promise<VoiceSelectionOutput> {
  return selectVoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceSelectionPrompt',
  input: {schema: VoiceSelectionInputSchema},
  output: {schema: VoiceSelectionOutputSchema},
  prompt: `You are an AI voice selector that picks a voice based on tone and gender.

  Based on the desired tone: {{{tone}}}, and gender: {{{gender}}}, pick a voice.
  Return only the name of the voice.
  The voice must be one of the following list: Algenib, Achernar, Hamal, Polaris.
  `,
});

const selectVoiceFlow = ai.defineFlow(
  {
    name: 'selectVoiceFlow',
    inputSchema: VoiceSelectionInputSchema,
    outputSchema: VoiceSelectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
