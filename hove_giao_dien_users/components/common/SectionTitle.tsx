import { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const SectionTitle = ({ children, subtitle, icon, action }: SectionTitleProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h2 className="text-xl font-bold text-gray-900">
            {children}
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};
