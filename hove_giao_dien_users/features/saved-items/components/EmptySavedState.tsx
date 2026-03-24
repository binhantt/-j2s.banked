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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Text strong style={{ fontSize: 18 }}>{title}</Text>
          <Text type="secondary">{description}</Text>
        </div>
      }
    >
      <Button type="primary" size="large" onClick={onAction}>
        {actionLabel}
      </Button>
    </Empty>
  );
};
