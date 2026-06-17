import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface DraftItem {
  id: string;
  title: string;
  lastEdited: string;
  status: 'draft' | 'published';
}

interface WritingWorkspaceCardProps {
  drafts: DraftItem[];
  published: DraftItem[];
  totalDrafts: number;
}

export default function WritingWorkspaceCard({ drafts, published, totalDrafts }: WritingWorkspaceCardProps) {
  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Writing Workspace</h3>
        <Button variant="ghost" className="text-purple-600 dark:text-purple-400 text-sm font-medium p-0 h-auto">View all drafts →</Button>
      </div>
      <div className="flex gap-4 mb-4 border-b border-border">
        <button className="pb-3 px-2 font-semibold text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400">Drafts ({totalDrafts})</button>
        <button className="pb-3 px-2 font-semibold text-foreground-secondary hover:text-foreground">Published (58)</button>
      </div>
      <div className="space-y-3">
        {drafts.map((draft) => (
          <div key={draft.id} className="flex items-start justify-between pb-3 border-b border-border-subtle last:border-0 last:pb-0 hover:bg-background-subtle p-2 -mx-2 rounded transition-colors">
            <div className="flex-1">
              <p className="font-medium text-foreground">{draft.title}</p>
              <p className="text-foreground-secondary text-xs mt-1">Last edited: {draft.lastEdited}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400">
              <ArrowRight size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
