import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Apr 29', likes: 1200, feedback: 400, bookmarks: 240 },
  { date: 'May 6', likes: 1100, feedback: 380, bookmarks: 260 },
  { date: 'May 13', likes: 1400, feedback: 450, bookmarks: 280 },
  { date: 'May 20', likes: 1300, feedback: 420, bookmarks: 300 },
  { date: 'May 27', likes: 1500, feedback: 500, bookmarks: 320 },
  { date: 'Jun 3', likes: 1400, feedback: 480, bookmarks: 310 },
];

export default function EngagementChart() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">Engagement Trend</h3>
        <button className="text-gray-600 text-sm font-medium hover:text-gray-900">Last 30 Days ↓</button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value) => value.toLocaleString()}
          />
          <Legend />
          <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="feedback" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="bookmarks" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
