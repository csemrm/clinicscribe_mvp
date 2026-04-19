import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export default function Button({
  children,
  className = '',
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & { className?: string }) {
  return (
    <button className={`btn ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
