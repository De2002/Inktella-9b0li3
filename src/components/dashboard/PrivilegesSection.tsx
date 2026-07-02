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
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <h3 className="font-bold text-lg text-foreground mb-4">Current Privileges</h3>
      <p className="text-foreground-secondary text-sm mb-4">5/5 Unlocked</p>
      <div className="space-y-2">
        {privileges.map((privilege) => (
          <div key={privilege.id} className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Check size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-foreground font-medium text-sm">{privilege.name}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full py-2 px-4 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-200 font-semibold rounded-lg transition-colors text-sm">
        🎨 Custom Profile Theme
      </button>
    </div>
  );
}
