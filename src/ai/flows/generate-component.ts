'use server';

/**
 * @fileOverview An AI agent that generates website components from a description.
 *
 * - generateComponent - A function that generates a website component.
 * - GenerateComponentInput - The input type for the generateComponent function.
 * - GenerateComponentOutput - The return type for the generateComponent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComponentInputSchema = z.object({
  description: z.string().describe('The description of the website component to generate.'),
});
export type GenerateComponentInput = z.infer<typeof GenerateComponentInputSchema>;

const ComponentPropertySchema = z.object({
  id: z.string().describe('The unique identifier. For content, this is a data-id attribute. For styles, this is the CSS custom property name (e.g., "--hover-color").'),
  label: z.string().describe('A user-friendly label for this property (e.g., "Card Title", "Button Hover Color").'),
  type: z.enum(['text', 'image_url', 'link_url', 'color']).describe('The type of property, used to determine the editor UI.'),
  value: z.string().describe('The initial value of the property.'),
});

const GenerateComponentOutputSchema = z.object({
  code: z
    .string()
    .describe(
      'The self-contained HTML for the generated component, with inline styles, data-id attributes on editable elements, and a <style> block for interactivity and custom properties.'
    ),
  properties: z.array(ComponentPropertySchema).describe('An array of editable properties within the component.'),
});
export type GenerateComponentOutput = z.infer<typeof GenerateComponentOutputSchema>;

export async function generateComponent(input: GenerateComponentInput): Promise<GenerateComponentOutput> {
  return generateComponentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComponentPrompt',
  input: {schema: GenerateComponentInputSchema},
  output: {schema: GenerateComponentOutputSchema},
  prompt: `You are an AI assistant that generates professional, self-contained HTML components. Your task is to create a single, ready-to-use HTML component based on the user's description.

**CRITICAL INSTRUCTIONS:**

1.  **Self-Contained HTML:** The generated code must be a single block of HTML with a <style> block for any non-trivial styling.
    *   **Base Styling:** Use inline \`style\` attributes for simple, static styling.
    *   **Advanced & Interactive Styling:** For ANY interactivity (like \`:hover\`) or complex layouts, you MUST include a \`<style>\` block. Use unique class names to avoid conflicts.
    *   **No JavaScript:** Do NOT include any \`<script>\` tags.

2.  **PROFESSIONAL DESIGN:** Create visually appealing, modern, and production-ready components. Use good spacing, harmonious colors, and subtle effects.

3.  **EDITABLE PROPERTIES & JSON-ONLY OUTPUT:** Your entire response MUST be a single, raw JSON object. The JSON must have two keys: \`code\` and \`properties\`.

    *   **Content Properties ('text', 'image_url', 'link_url'):**
        *   For editable content (text, image sources, link URLs), add a unique \`data-id\` attribute to the HTML tag. e.g., \`<h2 data-id="title-1">...</h2>\`.
        *   The \`data-id\` must be a short, random alphanumeric string.
        *   Create a corresponding entry in the \`properties\` array with the same \`id\`.

    *   **Style Properties ('color'):**
        *   For **customizable colors** (e.g., "a card with a customizable border color on hover"), you MUST use CSS custom properties (variables).
        *   In the \`<style>\` block, define the variable within a class (e.g., \`.card-a4b1 { --hover-border-color-xyz: #007bff; }\`).
        *   Use the variable in your CSS rule (e.g., \`.card-a4b1:hover { border-color: var(--hover-border-color-xyz); }\`).
        *   In the \`properties\` array, add an entry for this color.
        *   The \`id\` for this property MUST be the exact CSS variable name (e.g., \`"--hover-border-color-xyz"\`).
        *   The \`type\` MUST be \`"color"\`.
        *   The \`label\` must be user-friendly (e.g., "Hover Border Color").
        *   The \`value\` must be the initial hex color string.

4.  **PLACEHOLDER IMAGES:** Use \`https://placehold.co/<width>x<height>.png\` for placeholders and add a descriptive \`data-ai-hint\` attribute.

5.  **RESPONSIVE & STRUCTURAL COMPONENTS**: For complex components like navigation bars, hero sections, or footers, you MUST use modern layout techniques like Flexbox or Grid to ensure they are responsive and adapt well to different screen sizes. Do not use floats or older techniques.

**User Description:**
"{{{description}}}"

**Example for "a responsive navigation bar with a logo and links":**
{
  "code": "<style>.navbar-f4j7 { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .logo-g8h2 { font-weight: bold; font-size: 1.5rem; } .nav-links-k3l5 { display: flex; gap: 1.5rem; list-style: none; margin: 0; padding: 0; } .nav-link-a9b1 { text-decoration: none; color: #333; transition: color 0.3s; } .nav-link-a9b1:hover { color: var(--link-hover-color-p5q8); }</style><nav class=\\"navbar-f4j7\\"><a href=\\"#\\" data-id=\\"logo-g8h2\\" class=\\"logo-g8h2\\">Logo</a><ul data-id=\\"nav-links-k3l5\\" class=\\"nav-links-k3l5\\"><li><a href=\\"#\\" data-id=\\"nav-link-1\\" class=\\"nav-link-a9b1\\">Home</a></li><li><a href=\\"#\\" data-id=\\"nav-link-2\\" class=\\"nav-link-a9b1\\">About</a></li><li><a href=\\"#\\" data-id=\\"nav-link-3\\" class=\\"nav-link-a9b1\\">Contact</a></li></ul></nav>",
  "properties": [
    { "id": "logo-g8h2", "label": "Logo Text", "type": "text", "value": "Logo" },
    { "id": "logo-g8h2", "label": "Logo Link", "type": "link_url", "value": "#" },
    { "id": "nav-link-1", "label": "Nav Link 1 Text", "type": "text", "value": "Home" },
    { "id": "nav-link-1", "label": "Nav Link 1 URL", "type": "link_url", "value": "#" },
    { "id": "nav-link-2", "label": "Nav Link 2 Text", "type": "text", "value": "About" },
    { "id": "nav-link-2", "label": "Nav Link 2 URL", "type": "link_url", "value": "#" },
    { "id": "nav-link-3", "label": "Nav Link 3 Text", "type": "text", "value": "Contact" },
    { "id": "nav-link-3", "label": "Nav Link 3 URL", "type": "link_url", "value": "#" },
    { "id": "--link-hover-color-p5q8", "label": "Link Hover Color", "type": "color", "value": "#007bff" }
  ]
}
`,
});

const generateComponentFlow = ai.defineFlow(
  {
    name: 'generateComponentFlow',
    inputSchema: GenerateComponentInputSchema,
    outputSchema: GenerateComponentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
