"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { LeftSidebar } from '@/components/left-sidebar';
import { RightSidebar } from '@/components/right-sidebar';
import { WebCanvas } from '@/components/web-canvas';
import type { CanvasElement, SavedComponent, ComponentProperty } from '@/lib/types';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';

// Helper function to convert CSS object to string for inline styles
const cssObjectToString = (styles: React.CSSProperties | undefined) => {
  if (!styles) return '';
  return Object.entries(styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join(' ');
}

export default function WebGeniusApp() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [savedComponents, setSavedComponents] = useState<SavedComponent[]>([]);
  const [canvasBgColor, setCanvasBgColor] = useState<string>('#FFFFFF');

  // Hydrate state from localStorage on initial load
  useEffect(() => {
    try {
      const savedElements = localStorage.getItem('canvas-elements');
      if (savedElements) {
        setElements(JSON.parse(savedElements));
      }
      const savedComps = localStorage.getItem('saved-components');
      if (savedComps) {
        setSavedComponents(JSON.parse(savedComps));
      }
      const savedBgColor = localStorage.getItem('canvas-bg-color');
      if (savedBgColor) {
        setCanvasBgColor(JSON.parse(savedBgColor));
      }
    } catch (error) {
      console.error("Failed to parse state from localStorage", error);
    }
  }, []);

  // Persist elements to localStorage
  useEffect(() => {
    localStorage.setItem('canvas-elements', JSON.stringify(elements));
  }, [elements]);

  // Persist saved components to localStorage
  useEffect(() => {
    localStorage.setItem('saved-components', JSON.stringify(savedComponents));
  }, [savedComponents]);

  // Persist background color to localStorage
  useEffect(() => {
    localStorage.setItem('canvas-bg-color', JSON.stringify(canvasBgColor));
  }, [canvasBgColor]);


  const addElement = (type: 'heading' | 'paragraph' | 'image') => {
    const newElement: CanvasElement = {
      id: `${type}-${Date.now()}`,
      type,
      content:
        type === 'heading'
          ? 'Headline Text'
          : type === 'paragraph'
          ? 'This is a paragraph. You can edit this text.'
          : 'https://placehold.co/600x400.png',
      styles:
        type === 'image'
          ? {
              width: '300px',
              height: '200px',
            }
          : {},
      position: { x: 50, y: 50 },
    };
    setElements((prev) => [...prev, newElement]);
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const updateElementStyle = (id: string, newStyles: React.CSSProperties) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, styles: { ...el.styles, ...newStyles } } : el
      )
    );
  };

  const updateElementContent = (id: string, newContent: string) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, content: newContent } : el
      )
    );
  };
  
  const updateElementName = (id: string, newName: string) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === id ? { ...el, name: newName } : el
      )
    );
  };

  const updateElementProperty = (elementId: string, propertyId: string, propertyType: ComponentProperty['type'], newValue: string) => {
    setElements(prevElements => 
      prevElements.map(el => {
        if (el.id === elementId && el.type === 'component' && el.properties && el.baseCode) {
          
          let newBaseCode = el.baseCode;
          const originalProperty = el.properties.find(p => p.id === propertyId && p.type === propertyType);

          // For 'color' properties, update the CSS variable value in the baseCode string
          if (propertyType === 'color' && originalProperty) {
            const ruleToFind = `${originalProperty.id}: ${originalProperty.value}`;
            const ruleToReplace = `${originalProperty.id}: ${newValue}`;
            newBaseCode = newBaseCode.replace(ruleToFind, ruleToReplace);
          }
          
          // 1. Update the property value in our state representation
          const newProperties = el.properties.map(prop => 
            prop.id === propertyId && prop.type === propertyType ? { ...prop, value: newValue } : prop
          );
  
          // 2. Re-render the HTML content from the (potentially updated) baseCode
          const styleMatch = newBaseCode.match(/<style>[\s\S]*?<\/style>/);
          const styleBlock = styleMatch ? styleMatch[0] : '';
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(`<div>${newBaseCode}</div>`, 'text/html');
          
          newProperties.forEach(prop => {
            // Only update DOM for content properties, as color properties are handled in the baseCode
            if (prop.type !== 'color') {
              const targetNodes = doc.querySelectorAll(`[data-id="${prop.id}"]`);
              targetNodes.forEach(targetNode => {
                if (targetNode) {
                  switch (prop.type) {
                    case 'text':
                      targetNode.innerHTML = prop.value;
                      break;
                    case 'image_url':
                      if (targetNode.tagName.toLowerCase() === 'img') {
                        (targetNode as HTMLImageElement).src = prop.value;
                      }
                      break;
                    case 'link_url':
                      if (targetNode.tagName.toLowerCase() === 'a') {
                        (targetNode as HTMLAnchorElement).href = prop.value;
                      }
                      break;
                  }
                }
              });
            }
          });
  
          const newBodyContent = doc.body.firstChild?.innerHTML || '';
          const newContent = styleBlock + newBodyContent.replace(/<style>[\s\S]*?<\/style>/, '').trim();
  
          return {
            ...el,
            properties: newProperties,
            content: newContent,
            baseCode: newBaseCode, // Persist the updated baseCode
          };
        }
        return el;
      })
    );
  };

  const saveComponent = (component: SavedComponent) => {
    setSavedComponents(prev => [...prev, component]);
  };

  const deleteSavedComponent = (id: string) => {
    setSavedComponents(prev => prev.filter(c => c.id !== id));
  };

  const addComponentToCanvas = (component: SavedComponent) => {
    const newElement: CanvasElement = {
      id: `component-${Date.now()}`,
      type: 'component',
      content: component.code,
      baseCode: component.code,
      name: component.name,
      // Deep copy properties to ensure canvas elements are independent
      properties: JSON.parse(JSON.stringify(component.properties)),
      styles: {},
      position: { x: 50, y: 50 },
    };
    setElements((prev) => [...prev, newElement]);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, delta} = event;
    const activeId = active.id as string;
    
    setElements((elements) =>
      elements.map((element) => {
        if (element.id === activeId) {
          return {
            ...element,
            position: {
              x: element.position.x + delta.x,
              y: element.position.y + delta.y,
            },
          };
        }
        return element;
      })
    );
  };

  const handleExport = () => {
    // 1. Extract all <style> blocks from components and combine them
    const styleBlocks = elements
      .filter(el => el.type === 'component' && el.content.includes('<style>'))
      .map(el => {
        const match = el.content.match(/<style>([\s\S]*?)<\/style>/);
        return match ? match[1] : '';
      })
      .join('\n');

    // 2. Generate the HTML for each element, positioned absolutely
    const bodyContent = elements
      .map(el => {
        const contentWithoutStyle = el.content.replace(/<style>[\s\S]*?<\/style>/, '').trim();
        const wrapperStyle = `position: absolute; top: ${el.position.y}px; left: ${el.position.x}px; ${cssObjectToString(el.styles)}`;
        
        let elementHtml = '';
        switch (el.type) {
          case 'heading':
            elementHtml = `<h2 style="${wrapperStyle}">${el.content}</h2>`;
            break;
          case 'paragraph':
            elementHtml = `<p style="${wrapperStyle}">${el.content}</p>`;
            break;
          case 'image':
            elementHtml = `<img src="${el.content}" style="${wrapperStyle}" alt="User content" />`;
            break;
          case 'component':
             // For components, the wrapper div gets the position, internal elements are as-is
            elementHtml = `<div style="${wrapperStyle}">${contentWithoutStyle}</div>`;
            break;
          default:
            return '';
        }
        return elementHtml;
      })
      .join('\n    ');

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Website</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap" rel="stylesheet" />
  <style>
    body {
      font-family: 'Alegreya', serif;
      background-color: ${canvasBgColor};
      margin: 0;
      padding: 0;
    }
    .canvas-container {
      position: relative;
      width: 100%;
      min-height: 100vh;
      overflow: hidden;
    }
    ${styleBlocks}
  </style>
</head>
<body>
  <div class="canvas-container">
    ${bodyContent}
  </div>
</body>
</html>`;

    // 3. Trigger download
    const blob = new Blob([fullHtml.trim()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const selectedElement = elements.find(el => el.id === selectedElementId) || null;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header onExport={handleExport} />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar 
          onAddElement={addElement} 
          savedComponents={savedComponents}
          onSaveComponent={saveComponent}
          onDeleteSavedComponent={deleteSavedComponent}
          onAddComponentToCanvas={addComponentToCanvas}
        />
        <main className="flex-1 overflow-y-auto bg-background/80 scroll-smooth">
           <DndContext onDragEnd={handleDragEnd}>
              <WebCanvas
                elements={elements}
                onSelectElement={setSelectedElementId}
                selectedElementId={selectedElementId}
                onDeleteElement={deleteElement}
                canvasBackgroundColor={canvasBgColor}
              />
          </DndContext>
        </main>
        <RightSidebar 
          selectedElement={selectedElement}
          onUpdateStyle={updateElementStyle}
          onUpdateContent={updateElementContent}
          onUpdateName={updateElementName}
          onUpdateProperty={updateElementProperty}
          canvasBackgroundColor={canvasBgColor}
          onUpdateCanvasBackgroundColor={setCanvasBgColor}
        />
      </div>
    </div>
  );
}
