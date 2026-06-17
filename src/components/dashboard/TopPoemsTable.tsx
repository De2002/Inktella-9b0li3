import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Poem {
  id: string;
  title: string;
  image?: string;
  likes: number;
  feedback: number;
  bookmarks: number;
}

interface TopPoemsTableProps {
  poems: Poem[];
}

export default function TopPoemsTable({ poems }: TopPoemsTableProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">Top Performing Poems</h3>
        <Button variant="ghost" className="text-purple-600 text-sm font-medium p-0 h-auto">View all →</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Poem</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Likes</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Feedback</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Bookmarks</th>
            </tr>
          </thead>
          <tbody>
            {poems.map((poem) => (
              <tr key={poem.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    {poem.image && (
                      <img src={poem.image} alt={poem.title} className="w-8 h-8 rounded object-cover" />
                    )}
                    <span className="font-medium text-gray-900">{poem.title}</span>
                  </div>
                </td>
                <td className="text-center py-3 px-2 text-gray-700">{poem.likes}</td>
                <td className="text-center py-3 px-2 text-gray-700">{poem.feedback}</td>
                <td className="text-center py-3 px-2 text-gray-700">{poem.bookmarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
