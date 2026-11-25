import React from 'react';
import { cn, getStatusBadgeVariant } from '@/lib/utils';

export interface BadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, className, size = 'sm' }) => {
  const styles = getStatusBadgeVariant(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        styles.bg,
        styles.text,
        styles.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', styles.dot)} />
      {status}
    </span>
  );
};

