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
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">Writing Workspace</h3>
        <Button variant="ghost" className="text-purple-600 text-sm font-medium p-0 h-auto">View all drafts →</Button>
      </div>
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button className="pb-3 px-2 font-semibold text-purple-600 border-b-2 border-purple-600">Drafts ({totalDrafts})</button>
        <button className="pb-3 px-2 font-semibold text-gray-600 hover:text-gray-900">Published (58)</button>
      </div>
      <div className="space-y-3">
        {drafts.map((draft) => (
          <div key={draft.id} className="flex items-start justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 p-2 -mx-2 rounded transition-colors">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{draft.title}</p>
              <p className="text-gray-600 text-xs mt-1">Last edited: {draft.lastEdited}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-600">
              <ArrowRight size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
