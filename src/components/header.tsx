import { Download, Flame } from 'lucide-react';
import { Button } from './ui/button';

export function Header({ onExport }: { onExport: () => void }) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-card shrink-0">
      <div className="flex items-center gap-2">
        <Flame className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-headline font-bold tracking-wider text-primary">
          WebGenius
        </h1>
      </div>
      <Button onClick={onExport} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export HTML
      </Button>
    </header>
  );
}
