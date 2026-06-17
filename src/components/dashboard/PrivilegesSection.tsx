import { Check } from 'lucide-react';

interface Privilege {
  id: string;
  name: string;
  icon: string;
}

interface PrivilegesSectionProps {
  privileges: Privilege[];
}

export default function PrivilegesSection({ privileges }: PrivilegesSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="font-bold text-lg text-gray-900 mb-4">Current Privileges</h3>
      <p className="text-gray-600 text-sm mb-4">5/5 Unlocked</p>
      <div className="space-y-2">
        {privileges.map((privilege) => (
          <div key={privilege.id} className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center">
              <Check size={14} className="text-purple-600" />
            </div>
            <span className="text-gray-900 font-medium text-sm">{privilege.name}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold rounded-lg transition-colors text-sm">
        🎨 Custom Profile Theme
      </button>
    </div>
  );
}
