import React from 'react';

export const Loading: React.FC<{ size?: number; label?: string }> = ({ size = 48, label }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '4px solid rgba(0,0,0,0.08)',
          borderTopColor: '#0b74ff',
          animation: 'spin 1s linear infinite',
        }}
      />
      {label ? <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div> : null}

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
};
