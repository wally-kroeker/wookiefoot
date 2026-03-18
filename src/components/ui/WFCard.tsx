import { ReactNode } from 'react';

interface WFCardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'accent';
  className?: string;
}

const variantStyles = {
  default: 'bg-bg-card rounded-xl border border-border-subtle shadow-card p-6 hover:shadow-card-hover transition-shadow duration-200',
  elevated: 'bg-bg-card rounded-xl border border-border-subtle shadow-elevated p-6 hover:shadow-card-hover transition-shadow duration-200',
  accent: 'bg-bg-card rounded-xl border border-border-accent shadow-card p-6 hover:shadow-card-hover transition-shadow duration-200',
};

export default function WFCard({ children, variant = 'default', className = '' }: WFCardProps) {
  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}
