import { useState } from 'react';
import { Trash2, Edit2, BookOpen, Badge } from 'lucide-react';

interface Poem {
  id: string;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  like_count: number;
  feedback_count: number;
}

interface MyPoemsSectionProps {
  userId: string;
}

export default function MyPoemsSection({ userId }: MyPoemsSectionProps) {
  // Mock data
  const [poems, setPoems] = useState<Poem[]>([
    {
      id: '1',
      title: 'Moonlight Whispers',
      content: 'In the silence of night, voices emerge... A meditation on presence and solitude.',
      published: true,
      created_at: '2024-12-15',
      like_count: 145,
      feedback_count: 23,
    },
    {
      id: '2',
      title: 'Urban Echoes',
      content: 'Streets alive with untold stories, each corner a character. Exploring the pulse of the city.',
      published: true,
      created_at: '2024-12-10',
      like_count: 98,
      feedback_count: 18,
    },
    {
      id: '3',
      title: 'Silent Streets (Draft)',
      content: 'A work in progress exploring themes of isolation and connection in modern urban life.',
      published: false,
      created_at: '2024-12-08',
      like_count: 0,
      feedback_count: 0,
    },
    {
      id: '4',
      title: 'Ocean\'s Song',
      content: 'The rhythm of waves carries ancient wisdom. A meditation on time, change, and continuity.',
      published: true,
      created_at: '2024-12-01',
      like_count: 234,
      feedback_count: 42,
    },
    {
      id: '5',
      title: 'Forgotten Memories',
      content: 'Fragments of the past whisper through forgotten corridors of memory.',
      published: false,
      created_at: '2024-11-28',
      like_count: 0,
      feedback_count: 0,
    },
  ]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this poem? This action cannot be undone.')) {
      setPoems(poems.filter(p => p.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    console.log('Edit poem:', id);
    // Navigate to edit page
  };

  const publishedCount = poems.filter(p => p.published).length;
  const draftCount = poems.filter(p => !p.published).length;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Poems</h2>
            <p className="text-sm text-foreground/60">
              {publishedCount} published • {draftCount} draft{draftCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Poems List */}
      {poems.length > 0 ? (
        <div className="space-y-3">
          {poems.map((poem) => (
            <div
              key={poem.id}
              className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-background/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{poem.title}</h3>
                  {poem.published ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex-shrink-0">
                      <Badge className="w-3 h-3" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex-shrink-0">
                      <Badge className="w-3 h-3" />
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/70 line-clamp-2">{poem.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-foreground/60">
                    {new Date(poem.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {poem.published && (
                    <>
                      <span className="text-xs text-red-600 dark:text-red-400">❤️ {poem.like_count} likes</span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">💬 {poem.feedback_count} feedback</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(poem.id)}
                  className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                  title="Edit poem"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(poem.id)}
                  className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                  title="Delete poem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <BookOpen className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/60">No poems yet. Start writing your first poem!</p>
        </div>
      )}
    </div>
  );
}
