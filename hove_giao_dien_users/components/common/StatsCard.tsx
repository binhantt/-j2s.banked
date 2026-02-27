import { Card } from 'antd';
import { ReactNode } from 'react';

interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({ value, label, icon, color = 'primary', trend }: StatsCardProps) => {
  const colorClasses = {
    primary: 'text-indigo-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <Card className="text-center">
      <div className="flex flex-col items-center gap-2">
        {icon && <div className="text-2xl mb-1">{icon}</div>}
        <div className={`text-3xl font-bold ${colorClasses[color]}`}>
          {value}
        </div>
        <div className="text-sm text-gray-600 mt-1">{label}</div>
        {trend && (
          <div
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </Card>
  );
};
