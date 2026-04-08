import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg shrink-0"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {message}
          </p>
        </div>

        <div
          className="flex justify-end gap-3 pt-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
