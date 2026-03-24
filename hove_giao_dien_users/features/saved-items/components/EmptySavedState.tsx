import { Empty, Button, Typography } from 'antd';

const { Text } = Typography;

interface EmptySavedStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const EmptySavedState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptySavedStateProps) => {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <Text strong style={{ fontSize: 20, color: '#0f172a' }}>{title}</Text>
          <Text style={{ fontSize: 15, color: '#64748b' }}>{description}</Text>
        </div>
      }
      style={{ padding: '48px 0' }}
    >
      <Button 
        type="primary" 
        size="large" 
        onClick={onAction}
        style={{
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          border: 'none',
          fontWeight: 700,
          fontSize: 15,
          paddingInline: 32,
          boxShadow: '0 6px 16px rgba(22,163,74,0.15)',
          marginTop: 12
        }}
      >
        {actionLabel}
      </Button>
    </Empty>
  );
};
