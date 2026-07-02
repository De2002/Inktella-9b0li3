import { Button } from '@/components/ui/button';

interface Poem {
  id: string;
  title: string;
  likes: number;
  feedback: number;
  bookmarks: number;
}

interface TopPoemsTableProps {
  poems: Poem[];
}

export default function TopPoemsTable({ poems }: TopPoemsTableProps) {
  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Top Performing Poems</h3>
        <Button variant="ghost" className="text-purple-600 dark:text-purple-400 text-sm font-medium p-0 h-auto">View all →</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-semibold text-foreground">Poem</th>
              <th className="text-center py-3 px-2 font-semibold text-foreground">Likes</th>
              <th className="text-center py-3 px-2 font-semibold text-foreground">Feedback</th>
              <th className="text-center py-3 px-2 font-semibold text-foreground">Bookmarks</th>
            </tr>
          </thead>
          <tbody>
            {poems.map((poem, index) => (
              <tr key={poem.id} className="border-b border-border-subtle hover:bg-background-subtle transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300" aria-label={`Rank ${index + 1}`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{poem.title}</span>
                  </div>
                </td>
                <td className="text-center py-3 px-2 text-foreground-secondary">{poem.likes}</td>
                <td className="text-center py-3 px-2 text-foreground-secondary">{poem.feedback}</td>
                <td className="text-center py-3 px-2 text-foreground-secondary">{poem.bookmarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
