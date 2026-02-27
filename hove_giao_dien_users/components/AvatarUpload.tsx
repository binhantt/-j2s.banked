import { useState } from 'react';
import { Upload, Avatar, message, Button } from 'antd';
import { UserOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import { userApi } from '@/lib/userApi';
import { useAuthStore } from '@/store/useAuthStore';

interface AvatarUploadProps {
  userId: number;
  currentAvatar?: string;
  onAvatarChange?: (avatarUrl: string | null) => void;
  size?: number;
}

export default function AvatarUpload({ 
  userId, 
  currentAvatar, 
  onAvatarChange,
  size = 120 
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentAvatar);
  const [loading, setLoading] = useState(false);
  const { updateUserAvatar } = useAuthStore();

  const handleUpload = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể upload file ảnh!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    setLoading(true);
    try {
      const result = await userApi.uploadAvatar(userId, file);
      setAvatarUrl(result.avatarUrl);
      
      // Cập nhật auth store
      updateUserAvatar(result.avatarUrl);
      
      message.success('Cập nhật avatar thành công!');
      
      if (onAvatarChange) {
        onAvatarChange(result.avatarUrl);
      }
    } catch (error) {
      message.error('Không thể upload avatar');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }

    return false;
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await userApi.deleteAvatar(userId);
      setAvatarUrl(undefined);
      
      // Cập nhật auth store
      updateUserAvatar(null);
      
      message.success('Đã xóa avatar');
      
      if (onAvatarChange) {
        onAvatarChange(null);
      }
    } catch (error) {
      message.error('Không thể xóa avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <div className="relative inline-block">
        <Avatar
          size={size}
          src={avatarUrl}
          icon={!avatarUrl && <UserOutlined />}
          className="border-2 border-gray-200"
        />
        
        <Upload
          showUploadList={false}
          beforeUpload={handleUpload}
          accept="image/*"
        >
          <Button
            type="primary"
            shape="circle"
            icon={<CameraOutlined />}
            loading={loading}
            size="small"
            className="absolute bottom-0 right-0"
          />
        </Upload>
      </div>

      {avatarUrl && (
        <div className="mt-3">
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={loading}
          >
            Xóa avatar
          </Button>
        </div>
      )}
    </div>
  );
}
