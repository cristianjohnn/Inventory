import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
        <Icon size={32} className="text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6 text-center max-w-sm">{message}</p>
      {action}
    </div>
  );
}
