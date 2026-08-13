import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
  // Close on Escape — a small but expected affordance for any modal.
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative bg-paper border border-ink/20 w-full max-w-md p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-600 text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink/50 hover:text-ink text-lg leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
