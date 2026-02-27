import { Spin } from 'antd';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState = ({ message = 'Đang tải...', fullScreen = false }: LoadingStateProps) => {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center' 
    : 'text-center py-12';

  return (
    <div className={containerClass}>
      <div>
        <Spin size="large" />
        {message && <div className="mt-4 text-sm text-gray-600">{message}</div>}
      </div>
    </div>
  );
};
