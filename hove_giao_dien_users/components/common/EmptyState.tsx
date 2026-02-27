import { Empty, Button } from 'antd';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Empty
        image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            {title && <div className="text-base font-medium text-gray-900 mb-1">{title}</div>}
            {description && <div className="text-sm text-gray-600">{description}</div>}
          </div>
        }
      >
        {action && (
          <Button type="primary" icon={action.icon} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Empty>
    </div>
  );
};
