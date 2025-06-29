'use server';

/**
 * @fileOverview Suggests styling improvements for website components using AI.
 *
 * - suggestComponentStyleImprovements - A function that takes component code and suggests style improvements.
 * - SuggestComponentStyleImprovementsInput - The input type for the suggestComponentStyleImprovements function.
 * - SuggestComponentStyleImprovementsOutput - The return type for the suggestComponentStyleImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestComponentStyleImprovementsInputSchema = z.object({
  componentCode: z
    .string()
    .describe('The code of the website component to be styled.'),
  themeDescription: z
    .string()
    .optional()
    .describe('A description of the desired website theme, including colors, fonts, and overall style.'),
});

export type SuggestComponentStyleImprovementsInput = z.infer<
  typeof SuggestComponentStyleImprovementsInputSchema
>;

const SuggestComponentStyleImprovementsOutputSchema = z.object({
  improvedComponentCode: z
    .string()
    .describe('The improved code for the website component, with styling suggestions applied.'),
  explanation: z
    .string()
    .describe('An explanation of the styling improvements made.'),
});

export type SuggestComponentStyleImprovementsOutput = z.infer<
  typeof SuggestComponentStyleImprovementsOutputSchema
>;

export async function suggestComponentStyleImprovements(
  input: SuggestComponentStyleImprovementsInput
): Promise<SuggestComponentStyleImprovementsOutput> {
  return suggestComponentStyleImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestComponentStyleImprovementsPrompt',
  input: {schema: SuggestComponentStyleImprovementsInputSchema},
  output: {schema: SuggestComponentStyleImprovementsOutputSchema},
  prompt: `You are a world-class AI web designer and developer, an expert in creating beautiful, functional, and professional website components. Your task is to improve the inline styling of an existing HTML component.

You will receive the HTML code for a component and an optional description of the desired theme. Your goal is to rewrite the component's HTML with significantly improved inline CSS to make it production-ready and visually stunning.

**CRITICAL REQUIREMENTS:**

1.  **Pure HTML & Inline CSS:** The output MUST be a single, self-contained block of HTML. All styling MUST be done using inline \`style\` attributes. Do NOT modify the component to use \`<script>\` tags, \`<style>\` blocks, external stylesheets, or JavaScript.
2.  **Modern & Professional Design:**
    *   Apply modern design principles. Enhance the layout, spacing (padding/margins), and typography.
    *   If a theme description is provided, adhere to it strictly. If not, create a harmonious and professional color scheme.
    *   Use subtle shadows and rounded corners to create a polished look.
    *   Ensure the component is responsive and looks great on all screen sizes. Use flexbox or other fluid layout techniques.
3.  **Semantic HTML:** Preserve the existing HTML structure but ensure it uses semantic tags where appropriate.
4.  **Placeholder Images:** If the component contains images, ensure they use \`https://placehold.co/\` and have a \`data-ai-hint\` attribute.
5.  **Output Format:** You MUST return two fields:
    *   \`improvedComponentCode\`: The raw HTML code for the improved component. Do not include any explanations, comments, or markdown formatting like \`\`\`html.
    *   \`explanation\`: A brief, clear explanation of the design improvements you made.

**Component Code to Improve:**
\`\`\`
{{{componentCode}}}
\`\`\`

**Desired Theme Description:**
{{{themeDescription}}}
`,
});

const suggestComponentStyleImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestComponentStyleImprovementsFlow',
    inputSchema: SuggestComponentStyleImprovementsInputSchema,
    outputSchema: SuggestComponentStyleImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
