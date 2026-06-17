import { Button } from '@/components/ui/button';

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
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Inktella Funding Members</h3>
          <p className="text-gray-600 text-sm mb-4">These amazing members help keep Inktella alive.</p>
          <div className="flex items-center gap-2 mb-4">
            {members.map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                title={member.name}
              />
            ))}
          </div>
          <Button variant="ghost" className="text-purple-600 text-sm font-medium p-0 h-auto">
            View all members →
          </Button>
        </div>

        {/* Quote Section */}
        {quote && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200 flex-1">
            <div className="text-4xl text-purple-600 mb-2">❝</div>
            <p className="text-gray-900 font-serif italic text-sm leading-relaxed mb-2">{quote}</p>
            <p className="text-gray-700 text-xs font-medium">- {quoteAuthor}</p>
          </div>
        )}
      </div>
    </div>
  );
}
