import { useState } from 'react';
import { Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Member {
  id: string;
  name: string;
  username: string;
  avatar: string;
  tier: 'visionary' | 'patron' | 'believer' | 'supporter';
  joinDate: string;
  isTopSupporter: boolean;
  isFavorite?: boolean;
}

interface FundingMembersHallPageProps {}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Nova Verse',
    username: '@novaverse',
    avatar: 'https://i.pravatar.cc/150?img=1',
    tier: 'visionary',
    joinDate: 'Since Jan 2024',
    isTopSupporter: true,
  },
  {
    id: '2',
    name: 'Inkbound',
    username: '@inkbound',
    avatar: 'https://i.pravatar.cc/150?img=2',
    tier: 'patron',
    joinDate: 'Since Dec 2023',
    isTopSupporter: true,
  },
  {
    id: '3',
    name: 'Poetree',
    username: '@poetree',
    avatar: 'https://i.pravatar.cc/150?img=3',
    tier: 'visionary',
    joinDate: 'Since Nov 2023',
    isTopSupporter: true,
  },
  {
    id: '4',
    name: 'Wordsmith.',
    username: '@wordsmith',
    avatar: 'https://i.pravatar.cc/150?img=4',
    tier: 'patron',
    joinDate: 'Since Oct 2023',
    isTopSupporter: true,
  },
  {
    id: '5',
    name: 'Orpheus',
    username: '@orpheus',
    avatar: 'https://i.pravatar.cc/150?img=5',
    tier: 'patron',
    joinDate: 'Since Sep 2023',
    isTopSupporter: false,
  },
  {
    id: '6',
    name: 'Luna Muse',
    username: '@luna.muse',
    avatar: 'https://i.pravatar.cc/150?img=6',
    tier: 'believer',
    joinDate: 'Since Aug 2023',
    isTopSupporter: true,
  },
  {
    id: '7',
    name: 'Pen & Soul',
    username: '@penandsoulsoul',
    avatar: 'https://i.pravatar.cc/150?img=7',
    tier: 'believer',
    joinDate: 'Since Aug 2023',
    isTopSupporter: false,
  },
  {
    id: '8',
    name: 'Echoes',
    username: '@echoes',
    avatar: 'https://i.pravatar.cc/150?img=8',
    tier: 'believer',
    joinDate: 'Since Jul 2023',
    isTopSupporter: false,
  },
  {
    id: '9',
    name: 'Quiet Ink',
    username: '@quietink',
    avatar: 'https://i.pravatar.cc/150?img=9',
    tier: 'supporter',
    joinDate: 'Since Jul 2023',
    isTopSupporter: false,
  },
  {
    id: '10',
    name: 'The Scribbler',
    username: '@scribbler',
    avatar: 'https://i.pravatar.cc/150?img=10',
    tier: 'supporter',
    joinDate: 'Since Jun 2023',
    isTopSupporter: false,
  },
  {
    id: '11',
    name: 'Wandering Pen',
    username: '@wanderingpen',
    avatar: 'https://i.pravatar.cc/150?img=11',
    tier: 'supporter',
    joinDate: 'Since Jun 2023',
    isTopSupporter: false,
  },
  {
    id: '12',
    name: 'Paper Dreams',
    username: '@paper.dreams',
    avatar: 'https://i.pravatar.cc/150?img=12',
    tier: 'supporter',
    joinDate: 'Since May 2023',
    isTopSupporter: false,
  },
];

const recentSupporters = [
  { id: '1', name: 'Midnight Reader', username: '@midnight.reader', avatar: 'https://i.pravatar.cc/150?img=20', timeAgo: '2 days ago' },
  { id: '2', name: 'Versed Soul', username: '@versed.soul', avatar: 'https://i.pravatar.cc/150?img=21', timeAgo: '5 days ago' },
  { id: '3', name: 'Starlit Lines', username: '@starlit.lines', avatar: 'https://i.pravatar.cc/150?img=22', timeAgo: '1 week ago' },
];

const tierColors = {
  visionary: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300', icon: '✨' },
  patron: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', icon: '✒️' },
  believer: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-700 dark:text-indigo-300', icon: '🌱' },
  supporter: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', icon: '💙' },
};

const tierLabels = {
  visionary: 'Visionary',
  patron: 'Patron',
  believer: 'Believer',
  supporter: 'Supporter',
};

const MemberCard = ({ member }: { member: Member }) => {
  const [isFavorited, setIsFavorited] = useState(member.isFavorite || false);
  const tierColor = tierColors[member.tier];

  return (
    <div className="bg-surface border border-border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
      <div className="relative mb-4">
        <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full object-cover" />
        {member.isTopSupporter && <div className="absolute top-0 right-0 text-2xl">⭐</div>}
      </div>
      <h3 className="font-bold text-lg text-foreground mb-1">{member.name}</h3>
      <p className="text-foreground-secondary text-sm mb-3">{member.username}</p>
      <div className={`${tierColor.bg} ${tierColor.text} px-3 py-1 rounded-full text-xs font-semibold mb-3`}>
        {tierColor.icon} {tierLabels[member.tier]}
      </div>
      <p className="text-foreground-muted text-xs mb-4">{member.joinDate}</p>
      {member.isTopSupporter && (
        <div className="mb-4 flex items-center justify-center gap-1">
          <span className="text-yellow-500">⭐</span>
          <span className="text-foreground-secondary text-xs font-medium">Top Supporter</span>
        </div>
      )}
      <button
        onClick={() => setIsFavorited(!isFavorited)}
        className={`transition-colors ${isFavorited ? 'text-red-500' : 'text-foreground-secondary hover:text-red-500'}`}
      >
        <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
};

export default function FundingMembersHallPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const itemsPerPage = 8;
  const totalPages = Math.ceil(mockMembers.length / itemsPerPage);
  const paginatedMembers = mockMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-8 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🙏</span>
                <h1 className="text-4xl font-bold text-foreground">Funding Members Hall</h1>
              </div>
              <p className="text-foreground-secondary max-w-2xl">
                These incredible members help keep Inktella alive — empowering poets, inspiring words, and building a home for creativity. We're deeply grateful.{' '}
                <span className="text-purple-600">💜</span>
              </p>
            </div>
            {/* Hall of Gratitude Stats */}
            <div className="bg-surface border border-border rounded-lg p-6 min-w-max">
              <h3 className="font-bold text-lg text-foreground mb-6">Hall of Gratitude</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="font-bold text-2xl text-foreground">248</p>
                  <p className="text-foreground-secondary text-xs">Funding Members</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💜</span>
                  </div>
                  <p className="font-bold text-2xl text-foreground">15,870</p>
                  <p className="text-foreground-secondary text-xs">Total Support</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✨</span>
                  </div>
                  <p className="font-bold text-2xl text-foreground">35</p>
                  <p className="text-foreground-secondary text-xs">Visionaries</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📅</span>
                  </div>
                  <p className="font-bold text-2xl text-foreground">2023</p>
                  <p className="text-foreground-secondary text-xs">Since Inception</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-8">
            {[
              { id: 'all', label: 'All Members' },
              { id: 'top', label: 'Top Supporters' },
              { id: 'recent', label: 'Recent Supporters' },
              { id: 'tier', label: 'By Tier' },
              { id: 'inception', label: 'Since Inception' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-surface border border-border text-foreground hover:border-purple-400'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          {/* Members Grid */}
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-6 mb-8">
              {paginatedMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <button className="px-3 py-2 rounded border border-border text-foreground hover:bg-background-subtle">← Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-surface border border-border text-foreground hover:bg-background-subtle'
                  }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 5 && <span className="text-foreground-secondary">...</span>}
              <button className="px-3 py-2 rounded border border-border text-foreground hover:bg-background-subtle">Next →</button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Thank You Note */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                <span className="text-2xl">✒️</span> Thank You Note
              </h3>
              <p className="text-foreground-secondary text-sm leading-relaxed mb-4">
                Inktella exists because of people who believe in the power of poetry and community. Your support fuels every word, every feature, and every dream.
              </p>
              <p className="text-purple-600 dark:text-purple-400 font-cursive text-lg">Thank you!</p>
            </div>

            {/* Latest Supporters */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <span className="text-2xl">🌟</span> Latest Supporters
              </h3>
              <div className="space-y-3">
                {recentSupporters.map((supporter) => (
                  <div key={supporter.id} className="flex items-center gap-3 pb-3 border-b border-border-subtle last:border-0">
                    <img src={supporter.avatar} alt={supporter.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{supporter.name}</p>
                      <p className="text-foreground-secondary text-xs">{supporter.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">View all recent supporters →</button>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900 to-indigo-50 dark:to-indigo-900 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
              <h3 className="font-bold text-lg text-foreground mb-2">Want to support Inktella?</h3>
              <p className="text-foreground-secondary text-sm mb-4">Join our mission and help keep this poetic home alive for everyone.</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white font-semibold">
                💜 Become a Funding Member
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
