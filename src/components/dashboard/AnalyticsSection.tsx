import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Heart, MessageSquare, Share2, Zap } from 'lucide-react';

interface AnalyticsSectionProps {
  userId: string;
}

export default function AnalyticsSection({ userId }: AnalyticsSectionProps) {
  // Mock data for analytics
  const bookmarksData = [
    { name: 'Week 1', bookmarks: 12, users: 8 },
    { name: 'Week 2', bookmarks: 19, users: 14 },
    { name: 'Week 3', bookmarks: 15, users: 11 },
    { name: 'Week 4', bookmarks: 28, users: 18 },
    { name: 'Week 5', bookmarks: 25, users: 16 },
    { name: 'Week 6', bookmarks: 35, users: 22 },
  ];

  const likesData = [
    { name: 'Mon', likes: 24, feedback: 12 },
    { name: 'Tue', likes: 32, feedback: 15 },
    { name: 'Wed', likes: 28, feedback: 18 },
    { name: 'Thu', likes: 45, feedback: 22 },
    { name: 'Fri', likes: 52, feedback: 25 },
    { name: 'Sat', likes: 38, feedback: 20 },
    { name: 'Sun', likes: 41, feedback: 28 },
  ];

  const criticPushesData = [
    { name: 'Poem A', value: 5, fill: '#a855f7' },
    { name: 'Poem B', value: 8, fill: '#f59e0b' },
    { name: 'Poem C', value: 3, fill: '#3b82f6' },
    { name: 'Poem D', value: 7, fill: '#10b981' },
  ];

  const statCards = [
    {
      icon: Heart,
      label: 'Total Likes',
      value: '2,847',
      change: '+12% this week',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: MessageSquare,
      label: 'Feedback Received',
      value: '156',
      change: '+8% this week',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Zap,
      label: 'Critic Pushes',
      value: '23',
      change: '+4 this week',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Share2,
      label: 'Total Bookmarks',
      value: '412',
      change: '+25% this week',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`${stat.bgColor} rounded-lg border border-border p-4`}>
              <div className="flex items-start justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-foreground/70 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mb-2">{stat.value}</p>
              <p className="text-xs text-foreground/60">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookmarks Trend */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Bookmarks Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookmarksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="bookmarks" fill="#3b82f6" name="Total Bookmarks" />
              <Bar dataKey="users" fill="#10b981" name="Users Who Bookmarked" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Likes & Feedback */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-foreground">Likes & Feedback</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={likesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="#ef4444"
                strokeWidth={2}
                name="Likes"
                dot={{ fill: '#ef4444', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="feedback"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Feedback"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Critic Pushes */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-foreground">Poems in Critic Pushes</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={criticPushesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {criticPushesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Critic Activity */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Critic Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">CR</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Critic Reviews pushed "Moonlight Whispers" to Picks</p>
                <p className="text-xs text-foreground/60">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">JD</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Jane Doe pushed "Urban Echoes" to Picks</p>
                <p className="text-xs text-foreground/60">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">MK</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Marco King pushed "Silent Streets" to Picks</p>
                <p className="text-xs text-foreground/60">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
