import { Code, Image as ImageIcon, Layers, Pilcrow, Plus, Type, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiComponentGenerator } from '@/components/ai-component-generator';
import type { SavedComponent } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface LeftSidebarProps {
  onAddElement: (type: 'heading' | 'paragraph' | 'image') => void;
  savedComponents: SavedComponent[];
  onSaveComponent: (component: SavedComponent) => void;
  onDeleteSavedComponent: (id: string) => void;
  onAddComponentToCanvas: (component: SavedComponent) => void;
}

export function LeftSidebar({ 
  onAddElement, 
  savedComponents, 
  onSaveComponent,
  onDeleteSavedComponent,
  onAddComponentToCanvas 
}: LeftSidebarProps) {
  return (
    <aside className="w-80 border-r bg-card flex flex-col">
      <Tabs defaultValue="components" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="m-2 flex-shrink-0">
          <TabsTrigger value="elements" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Elements
          </TabsTrigger>
          <TabsTrigger value="components" className="w-full">
            <Layers className="w-4 h-4 mr-2" />
            Components
          </TabsTrigger>
        </TabsList>
        <Separator className="flex-shrink-0" />
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="elements" className="p-4 space-y-4 mt-0">
            <h3 className="font-headline text-lg">Basic Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => onAddElement('heading')} className="h-20 flex-col gap-2">
                <Type className="w-6 h-6" />
                Heading
              </Button>
              <Button variant="outline" onClick={() => onAddElement('paragraph')} className="h-20 flex-col gap-2">
                <Pilcrow className="w-6 h-6" />
                Paragraph
              </Button>
              <Button variant="outline" onClick={() => onAddElement('image')} className="h-20 flex-col gap-2">
                <ImageIcon className="w-6 h-6" />
                Image
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="components" className="mt-0">
            <Accordion type="single" collapsible defaultValue="generate">
              <AccordionItem value="generate" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 font-headline text-lg hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5" /> AI Generator
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 border-t">
                  <AiComponentGenerator onSaveComponent={onSaveComponent} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="library" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 font-headline text-lg hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5" /> Component Library
                    <Badge variant="secondary">{savedComponents.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 border-t space-y-2">
                  {savedComponents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No saved components yet.</p>
                  ) : (
                    savedComponents.map(comp => (
                      <div key={comp.id} className="p-2 border rounded-md flex justify-between items-center group">
                        <span className="font-medium">{comp.name}</span>
                        <div className="flex items-center">
                          <Button size="sm" variant="ghost" onClick={() => onAddComponentToCanvas(comp)}>
                            <Plus className="w-4 h-4 mr-2" />
                              Add
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => onDeleteSavedComponent(comp.id)}>
                            <Trash2 className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
