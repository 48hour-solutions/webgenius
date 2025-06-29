'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateComponent, type GenerateComponentOutput } from '@/ai/flows/generate-component';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Save, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { SavedComponent } from '@/lib/types';

interface AiComponentGeneratorProps {
  onSaveComponent: (component: SavedComponent) => void;
}

export function AiComponentGenerator({ onSaveComponent }: AiComponentGeneratorProps) {
  const [description, setDescription] = useState('');
  const [generatedComponent, setGeneratedComponent] = useState<GenerateComponentOutput | null>(null);
  const [componentName, setComponentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description) {
      toast({ title: 'Error', description: 'Please enter a description for the component.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setGeneratedComponent(null);
    setIsSaved(false);
    setComponentName('');
    try {
      const result = await generateComponent({ description });
      setGeneratedComponent(result);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error Generating Component', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleSave = () => {
    if (!generatedComponent) {
        toast({ title: 'Error', description: 'No component to save.', variant: 'destructive' });
        return;
    }
    if (!componentName) {
        toast({ title: 'Error', description: 'Please enter a name for the component.', variant: 'destructive' });
        return;
    }
    onSaveComponent({
        id: `comp-${Date.now()}`,
        name: componentName,
        code: generatedComponent.code,
        properties: generatedComponent.properties,
    });
    setIsSaved(true);
    toast({
        title: 'Component Saved!',
        description: `"${componentName}" has been added to your library.`,
        action: <CheckCircle className="text-green-500" />
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Describe the component you want to create. For example, "a simple call-to-action button".</p>
      <Textarea
        placeholder="e.g., A responsive pricing card with three tiers..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />
      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Component
          </>
        )}
      </Button>

      {generatedComponent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Component</CardTitle>
            <CardDescription>Preview of your AI-generated component.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-md bg-background overflow-x-auto max-h-60 overflow-y-auto">
               <div dangerouslySetInnerHTML={{ __html: generatedComponent.code }} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="component-name">Component Name</Label>
                <Input id="component-name" placeholder="e.g., Pricing Card" value={componentName} onChange={(e) => setComponentName(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={isSaved} className="w-full">
                {isSaved ? "Saved!" : <><Save className="mr-2 h-4 w-4" /> Save to Library</>}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
