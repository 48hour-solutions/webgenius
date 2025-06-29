import type { CanvasElement } from '@/lib/types';
import { CanvasElementWrapper } from './canvas-element-wrapper';
import { PlusCircle } from 'lucide-react';

interface WebCanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onDeleteElement: (id: string) => void;
  canvasBackgroundColor: string;
}

export function WebCanvas({ elements, selectedElementId, onSelectElement, onDeleteElement, canvasBackgroundColor }: WebCanvasProps) {
  return (
    <div 
      className="p-4 md:p-8 lg:p-12 min-h-full"
      onClick={() => onSelectElement(null)}
    >
      <div 
        className="relative max-w-4xl mx-auto bg-card shadow-lg rounded-lg p-8 min-h-[800px]"
        style={{ backgroundColor: canvasBackgroundColor }}
      >
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center py-20 border-2 border-dashed rounded-lg px-8">
                <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-muted-foreground font-headline">Your canvas is empty</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add elements from the left panel to get started.</p>
            </div>
          </div>
        )}
        {elements.map((element) => (
          <CanvasElementWrapper
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            onSelect={(e) => {
              e.stopPropagation();
              onSelectElement(element.id);
            }}
            onDelete={(e) => {
              e.stopPropagation();
              onDeleteElement(element.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
