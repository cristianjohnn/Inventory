import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { assetsApi } from '../../api/client.js';
import Modal from '../../components/ui/Modal.jsx';

export default function AssignModal({ isOpen, onClose, assetId, onSuccess }) {
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assetsApi.assign(assetId, employeeName);
      toast.success(`Assigned to ${employeeName}`);
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">Employee Name *</label>
          <input
            required
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            className="form-input"
            placeholder="Enter employee name"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            <UserPlus size={15} />
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
