import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZE_DEFAULTS = {
  sm: { width: 440, minWidth: 360 },
  md: { width: 540, minWidth: 400 },
  lg: { width: 680, minWidth: 480 },
  xl: { width: 900, minWidth: 560 },
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', resizable = true }) {
  const overlayRef = useRef();
  const panelRef = useRef();
  const [dimensions, setDimensions] = useState(null);
  const [anchor, setAnchor] = useState(null);
  const dragRef = useRef(null);

  // Reset dimensions when modal opens or size prop changes
  useEffect(() => {
    if (isOpen) {
      setDimensions(null);
      setAnchor(null);
    }
  }, [isOpen, size]);

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

  // Resize logic
  const handleMouseDown = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    
    // Lock the modal to fixed coordinates so it stops mirroring (centering)
    setAnchor(prev => {
      const currentLeft = prev?.left ?? rect.left;
      const currentTop = prev?.top ?? rect.top;
      
      dragRef.current = {
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        startLeft: currentLeft,
        startTop: currentTop,
      };
      
      return prev || { left: currentLeft, top: currentTop };
    });

    const handleMouseMove = (e) => {
      if (!dragRef.current) return;
      const { direction, startX, startY, startWidth, startHeight, startLeft } = dragRef.current;
      const config = SIZE_DEFAULTS[size] || SIZE_DEFAULTS.md;
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;

      if (direction.includes('e')) {
        newWidth = Math.max(config.minWidth, startWidth + (e.clientX - startX));
      }
      if (direction.includes('w')) {
        // Dragging left edge
        const diff = e.clientX - startX;
        newWidth = Math.max(config.minWidth, startWidth - diff);
        // If we didn't hit minWidth, shift left
        if (newWidth > config.minWidth) {
          newLeft = startLeft + diff;
        }
      }
      if (direction.includes('s')) {
        newHeight = Math.max(300, startHeight + (e.clientY - startY));
      }

      // Cap at viewport
      newWidth = Math.min(newWidth, window.innerWidth - 48);
      newHeight = Math.min(newHeight, window.innerHeight - 48);

      setDimensions({ width: newWidth, height: newHeight });
      // Only update anchor if we are moving 'w'
      if (direction.includes('w')) {
         setAnchor(prev => ({ ...prev, left: newLeft }));
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor =
      direction === 'se' ? 'nwse-resize' :
      direction === 'e' ? 'ew-resize' :
      direction === 's' ? 'ns-resize' : 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size]);

  if (!isOpen) return null;

  const config = SIZE_DEFAULTS[size] || SIZE_DEFAULTS.md;
  const panelWidth = dimensions?.width || config.width;
  const panelHeight = dimensions?.height || undefined;

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="modal-centering" style={anchor ? { justifyContent: 'flex-start', alignItems: 'flex-start', padding: 0 } : {}}>
        <div
          ref={panelRef}
          className="modal-panel"
          style={{
            width: `min(${panelWidth}px, calc(100vw - 32px))`,
            ...(panelHeight ? { height: panelHeight } : {}),
            ...(anchor ? { marginLeft: anchor.left, marginTop: anchor.top } : {})
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Orange accent bar */}
          <div className="modal-accent-bar" />

          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            className="modal-body"
            style={panelHeight ? { height: panelHeight - 120, maxHeight: 'none' } : {}}
          >
            {children}
          </div>

          {/* Resize handles */}
          {resizable && (
            <>
              <div
                className="modal-resize-handle modal-resize-e"
                onMouseDown={(e) => handleMouseDown(e, 'e')}
              />
              <div
                className="modal-resize-handle modal-resize-w"
                onMouseDown={(e) => handleMouseDown(e, 'w')}
              />
              <div
                className="modal-resize-handle modal-resize-s"
                onMouseDown={(e) => handleMouseDown(e, 's')}
              />
              <div
                className="modal-resize-handle modal-resize-se"
                onMouseDown={(e) => handleMouseDown(e, 'se')}
              />
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
