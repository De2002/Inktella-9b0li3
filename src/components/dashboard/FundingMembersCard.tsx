import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Member {
  id: string;
  name: string;
  avatar: string;
  since: string;
}

interface FundingMembersCardProps {
  members: Member[];
  quote?: string;
  quoteAuthor?: string;
}

export default function FundingMembersCard({ members, quote, quoteAuthor }: FundingMembersCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground mb-2">Inktella Funding Members</h3>
          <p className="text-foreground-secondary text-sm mb-4">These amazing members help keep Inktella alive.</p>
          <div className="flex items-center gap-2 mb-4">
            {members.map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-surface shadow-sm"
                title={member.name}
              />
            ))}
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/funding-members')}
            className="text-purple-600 dark:text-purple-400 text-sm font-medium p-0 h-auto"
          >
            View all members →
          </Button>
        </div>

        {/* Quote Section */}
        {quote && (
          <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900 to-blue-50 dark:to-blue-900 p-6 rounded-lg border border-purple-200 dark:border-purple-700 flex-1">
            <div className="text-4xl text-purple-600 dark:text-purple-400 mb-2">❝</div>
            <p className="text-foreground font-serif italic text-sm leading-relaxed mb-2">{quote}</p>
            <p className="text-foreground-secondary text-xs font-medium">- {quoteAuthor}</p>
          </div>
        )}
      </div>
    </div>
  );
}
