'use client';
import type { CanvasElement } from '@/lib/types';
import { Button } from './ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface CanvasElementWrapperProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function RenderedComponent({ htmlString }: { htmlString: string }) {
  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
}


export function CanvasElementWrapper({ element, isSelected, onSelect, onDelete }: CanvasElementWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({id: element.id});

  const style: React.CSSProperties = {
    position: 'absolute',
    top: element.position.y,
    left: element.position.x,
    transform: CSS.Translate.toString(transform),
  };

  const renderElement = () => {
    switch (element.type) {
      case 'heading':
        return <h2 className="font-headline text-4xl font-bold" style={element.styles}>{element.content}</h2>;
      case 'paragraph':
        return <p className="text-base leading-relaxed" style={element.styles}>{element.content}</p>;
      case 'image':
        return (
          <div className="relative" style={element.styles}>
            <Image
              src={element.content}
              alt="User uploaded content"
              fill
              className="object-cover rounded-md"
              data-ai-hint="website element"
            />
          </div>
        );
      case 'component':
        return <RenderedComponent htmlString={element.content} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'relative group p-2 rounded-lg transition-all z-10',
        { 'ring-2 ring-primary ring-offset-2 ring-offset-background z-20': isSelected },
        { 'hover:bg-primary/5': !isSelected }
      )}
    >
      <div className={cn(
        "absolute -top-3 -right-3 z-30 flex items-center gap-1 transition-opacity",
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <Button {...attributes} {...listeners} size="icon" variant="ghost" className="h-8 w-8 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="destructive" onClick={onDelete} className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {renderElement()}
    </div>
  );
}
