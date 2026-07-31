import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  ...rest
}) => {
  const base = {
    padding: size === 'sm' ? '6px 10px' : size === 'lg' ? '12px 18px' : '8px 14px',
    borderRadius: '10px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
  } as React.CSSProperties;

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#0b74ff', color: '#fff' },
    ghost: { background: 'transparent', color: '#0b1a2b', border: '1px solid #e6eefc' },
    danger: { background: '#e11d48', color: '#fff' },
  };

  const style = { ...base, ...variants[variant] };

  return (
    <button style={style} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};
