import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { assetsApi } from '../../api/client.js';
import Modal from '../../components/ui/Modal.jsx';

export default function AssignModal({ isOpen, onClose, assetId, onSuccess }) {
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeName.trim()) return;

    setLoading(true);
    try {
      await assetsApi.assign(assetId, employeeName.trim());
      toast.success('Asset assigned successfully');
      setEmployeeName('');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to assign employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Employee" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employeeName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Employee Full Name
          </label>
          <input
            type="text"
            id="employeeName"
            required
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !employeeName.trim()}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-900 dark:text-white transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Assigning...' : <><UserPlus size={16} /> Assign</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
