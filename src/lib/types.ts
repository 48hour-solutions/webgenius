export interface ComponentProperty {
  id: string; // Corresponds to data-id in HTML or a CSS variable name
  label: string;
  type: 'text' | 'image_url' | 'link_url' | 'color';
  value: string;
}

export interface CanvasElement {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'component';
  content: string;
  name?: string;
  styles: React.CSSProperties;
  position: { x: number; y: number };
  properties?: ComponentProperty[]; // For components, this holds current property values
  baseCode?: string; // For components, this is the original HTML template with data-ids
}

export interface SavedComponent {
  id: string;
  name: string;
  code: string; // This is the base HTML template
  properties: ComponentProperty[]; // This is the property schema with default values
}
