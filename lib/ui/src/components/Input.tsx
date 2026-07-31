import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export const Input: React.FC<InputProps> = ({ label, error, ...rest }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label ? <label style={{ fontSize: 13 }}>{label}</label> : null}
      <input
        {...rest}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: error ? '1px solid #e11d48' : '1px solid #e6eefc',
          outline: 'none',
        }}
      />
      {error ? <div style={{ color: '#e11d48', fontSize: 12 }}>{error}</div> : null}
    </div>
  );
};
