import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'primary';
  className?: string;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) => {
  const variantStyles = {
    default: 'border-border/50',
    success: 'border-success/30',
    warning: 'border-warning/30',
    destructive: 'border-destructive/30',
    primary: 'border-primary/30',
  };

  const iconStyles = {
    default: 'bg-gradient-to-br from-[#AE63F0]/20 to-[#62339A]/20 text-[#AE63F0] border border-[#AE63F0]/30',
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-[#FFD93F]/20 text-[#FFD93F] border border-[#FFD93F]/30',
    destructive: 'bg-destructive/20 text-destructive border border-destructive/30',
    primary: 'gradient-primary-purple text-white border border-[#62339A]/30 purple-glow',
  };

  return (
    <div
      className={cn(
        'stat-card border group relative overflow-hidden',
        variantStyles[variant],
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold tracking-tight text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-2 pt-1">
              <span
                className={cn(
                  'text-sm font-semibold px-2 py-0.5 rounded-md',
                  trend.isPositive 
                    ? 'text-success bg-success/10' 
                    : 'text-destructive bg-destructive/10'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-110 backdrop-blur-sm',
            iconStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
