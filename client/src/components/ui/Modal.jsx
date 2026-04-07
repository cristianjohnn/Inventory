import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={`w-full ${sizeClass} glass-card p-6 shadow-2xl animate-fade-in`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
