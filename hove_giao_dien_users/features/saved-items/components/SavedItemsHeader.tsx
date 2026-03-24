import { HeartFilled } from '@ant-design/icons';
import { Typography } from 'antd';

const { Title, Text } = Typography;

export const SavedItemsHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-green-400 to-green-500 text-white">
        <HeartFilled />
      </div>
      <div>
        <Title level={4} style={{ margin: 0 }}>Thư mục đã lưu</Title>
        <Text type="secondary">Quản lý việc làm và công ty bạn quan tâm</Text>
      </div>
    </div>
  );
};
