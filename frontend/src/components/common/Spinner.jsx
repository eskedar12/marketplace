import React from 'react';

export default function Spinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-ink/50 font-body text-sm ${className}`}>
      <span
        className="w-3.5 h-3.5 border-2 border-ink/20 border-t-juniper rounded-full animate-spin"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}
