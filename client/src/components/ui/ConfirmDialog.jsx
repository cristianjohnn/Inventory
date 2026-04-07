import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm glass-card p-6 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-rose-500/10">
            <AlertTriangle size={20} className="text-rose-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        </div>
        <p className="text-sm text-zinc-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
