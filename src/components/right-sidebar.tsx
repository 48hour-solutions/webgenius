'use client';
import { Palette, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import type { CanvasElement, ComponentProperty } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface RightSidebarProps {
  selectedElement: CanvasElement | null;
  onUpdateStyle: (id: string, styles: React.CSSProperties) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUpdateName: (id: string, name: string) => void;
  onUpdateProperty: (elementId: string, propertyId: string, propertyType: ComponentProperty['type'], newValue: string) => void;
  canvasBackgroundColor: string;
  onUpdateCanvasBackgroundColor: (color: string) => void;
}

export function RightSidebar({ 
  selectedElement, 
  onUpdateStyle, 
  onUpdateContent, 
  onUpdateName, 
  onUpdateProperty,
  canvasBackgroundColor,
  onUpdateCanvasBackgroundColor
}: RightSidebarProps) {
  const { theme, setTheme } = useTheme();

  // State for basic element properties
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState('');
  const [color, setColor] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  
  // State for component properties
  const [componentName, setComponentName] = useState('');
  const [dynamicProperties, setDynamicProperties] = useState<ComponentProperty[]>([]);


  useEffect(() => {
    if (selectedElement) {
      setContent(selectedElement.content);
      const styles = selectedElement.styles || {};
      
      if (selectedElement.type === 'heading' || selectedElement.type === 'paragraph') {
        setFontSize(parseFloat(styles.fontSize?.toString() || (selectedElement.type === 'heading' ? '36' : '16')).toString());
        setColor(styles.color?.toString() || '#000000');
      } else if (selectedElement.type === 'image') {
        setWidth(parseFloat(styles.width?.toString() || '300').toString());
        setHeight(parseFloat(styles.height?.toString() || '200').toString());
      } else if (selectedElement.type === 'component') {
        setComponentName(selectedElement.name || '');
        setDynamicProperties(selectedElement.properties ? JSON.parse(JSON.stringify(selectedElement.properties)) : []);
      }
    } else {
      // Clear states when no element is selected
      setContent('');
      setFontSize('');
      setColor('');
      setWidth('');
      setHeight('');
      setComponentName('');
      setDynamicProperties([]);
    }
  }, [selectedElement]);

  const handleContentBlur = () => {
    if (selectedElement && content !== selectedElement.content) {
      onUpdateContent(selectedElement.id, content);
    }
  };

  const handleStyleBlur = (
    property: keyof React.CSSProperties,
    value: string,
    isNumeric: boolean = false
  ) => {
    if (selectedElement) {
      const styleValue = isNumeric ? `${value}px` : value;
      // @ts-ignore
      if (styleValue !== selectedElement.styles[property]) {
        onUpdateStyle(selectedElement.id, { [property]: styleValue });
      }
    }
  };

  const handleNameBlur = () => {
    if(selectedElement && selectedElement.type === 'component' && componentName !== selectedElement.name) {
        onUpdateName(selectedElement.id, componentName);
    }
  }

  const handlePropertyChange = (propId: string, propType: ComponentProperty['type'], value: string) => {
    setDynamicProperties(prev => prev.map(p => 
        p.id === propId && p.type === propType ? {...p, value} : p
    ));
  }

  const handlePropertyBlur = (propId: string, propType: ComponentProperty['type']) => {
    if (selectedElement) {
        const prop = dynamicProperties.find(p => p.id === propId && p.type === propType);
        const originalProp = selectedElement.properties?.find(p => p.id === propId && p.type === propType);
        if (prop && prop.value !== originalProp?.value) {
            onUpdateProperty(selectedElement.id, propId, propType, prop.value);
        }
    }
  }

  const handleFontChange = (font: 'Alegreya' | 'Belleza') => {
    document.body.classList.remove('font-body', 'font-headline');
    if (font === 'Alegreya') {
        document.body.style.fontFamily = "'Alegreya', serif";
    } else {
        document.body.style.fontFamily = "'Belleza', sans-serif";
    }
  };

  return (
    <aside className="w-80 border-l bg-card flex flex-col">
      <Tabs defaultValue="theme" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="m-2 flex-shrink-0">
          <TabsTrigger value="theme" className="w-full">
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="properties" className="w-full" disabled={!selectedElement}>
             <Settings className="w-4 h-4 mr-2" />
            Properties
          </TabsTrigger>
        </TabsList>
        <Separator className="flex-shrink-0" />
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="theme" className="p-4 space-y-6 mt-0">
            <div>
              <Label className="font-headline text-lg">Color Scheme</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                  <Sun className="w-4 h-4 mr-2" /> Light
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                  <Moon className="w-4 h-4 mr-2" /> Dark
                </Button>
              </div>
            </div>

            <div>
              <Label className="font-headline text-lg">Typography</Label>
               <div className="mt-2">
                <Select onValueChange={(value: 'Alegreya' | 'Belleza') => handleFontChange(value)} >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Alegreya">Alegreya (Serif)</SelectItem>
                        <SelectItem value="Belleza">Belleza (Sans-Serif)</SelectItem>
                    </SelectContent>
                </Select>
               </div>
            </div>
            
            <Separator />

            <div>
              <Label className="font-headline text-lg flex items-center gap-2"><Monitor className="w-5 h-5"/> Canvas Settings</Label>
              <div className="mt-2 space-y-2">
                <Label htmlFor="canvas-bg">Background Color</Label>
                <Input
                  id="canvas-bg"
                  type="color"
                  value={canvasBackgroundColor}
                  onChange={(e) => onUpdateCanvasBackgroundColor(e.target.value)}
                  className="p-1 h-10 w-full"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="properties" className="p-4 space-y-4 mt-0">
            {selectedElement ? (
              <>
                <h3 className="font-headline text-lg capitalize">{selectedElement.type} Properties</h3>
                <Separator />
                
                {(selectedElement.type === 'heading' || selectedElement.type === 'paragraph' || selectedElement.type === 'image') && (
                  <div className="space-y-2">
                    <Label htmlFor="element-content">
                      {selectedElement.type === 'image' ? 'Image URL' : 'Text'}
                    </Label>
                    {selectedElement.type === 'heading' || selectedElement.type === 'paragraph' ? (
                      <Textarea
                        id="element-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={handleContentBlur}
                        rows={4}
                      />
                    ) : (
                      <Input
                        id="element-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={handleContentBlur}
                      />
                    )}
                  </div>
                )}

                {(selectedElement.type === 'heading' || selectedElement.type === 'paragraph') && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="font-size">Font Size (px)</Label>
                      <Input
                        id="font-size"
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        onBlur={() => handleStyleBlur('fontSize', fontSize, true)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        onBlur={() => handleStyleBlur('color', color)}
                        className="p-1 h-10 w-full"
                      />
                    </div>
                  </div>
                )}
                {selectedElement.type === 'image' && (
                   <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        onBlur={() => handleStyleBlur('width', width, true)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        onBlur={() => handleStyleBlur('height', height, true)}
                      />
                    </div>
                  </div>
                )}
                 {selectedElement.type === 'component' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="component-name-edit">Component Name</Label>
                        <Input 
                            id="component-name-edit"
                            value={componentName}
                            onChange={(e) => setComponentName(e.target.value)}
                            onBlur={handleNameBlur}
                        />
                    </div>
                    <Separator />
                    <h4 className="font-medium">Editable Properties</h4>
                     {dynamicProperties.length > 0 ? dynamicProperties.map((prop) => (
                       <div key={`${prop.id}-${prop.type}`} className="space-y-2">
                         <Label htmlFor={`prop-${prop.id}-${prop.type}`}>{prop.label}</Label>
                         {prop.type === 'color' ? (
                            <Input
                                id={`prop-${prop.id}-${prop.type}`}
                                type="color"
                                value={prop.value}
                                onChange={(e) => handlePropertyChange(prop.id, prop.type, e.target.value)}
                                onBlur={() => handlePropertyBlur(prop.id, prop.type)}
                                className="p-1 h-10 w-full"
                            />
                         ) : prop.value.includes('\n') ? (
                            <Textarea
                                id={`prop-${prop.id}-${prop.type}`}
                                value={prop.value}
                                onChange={(e) => handlePropertyChange(prop.id, prop.type, e.target.value)}
                                onBlur={() => handlePropertyBlur(prop.id, prop.type)}
                                rows={4}
                            />
                         ) : (
                           <Input
                             id={`prop-${prop.id}-${prop.type}`}
                             value={prop.value}
                             onChange={(e) => handlePropertyChange(prop.id, prop.type, e.target.value)}
                             onBlur={() => handlePropertyBlur(prop.id, prop.type)}
                           />
                         )}
                       </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">This component has no editable properties.</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Select an element on the canvas to see its properties.</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
