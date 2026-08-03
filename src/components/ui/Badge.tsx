import { ReactNode } from 'react';
import { classNames } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'yellow';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    gray: 'bg-slate-100 text-slate-600',
    blue: 'bg-primary-50 text-primary-700',
    green: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-secondary-50 text-secondary-700',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={classNames('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize', variants[variant], className)}>
      {children}
    </span>
  );
}

export function statusBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'active': case 'paid': case 'accepted': return 'green';
    case 'draft': case 'pending': case 'unpaid': return 'gray';
    case 'partial': return 'yellow';
    case 'sent': return 'blue';
    case 'overdue': case 'rejected': return 'red';
    default: return 'gray';
  }
}
