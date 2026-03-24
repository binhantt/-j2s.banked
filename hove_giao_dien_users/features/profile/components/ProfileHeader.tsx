import { Card, Button, Modal } from 'antd';
import { EditOutlined, MailOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import AvatarUpload from '@/components/AvatarUpload';

interface ProfileHeaderProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

export const ProfileHeader = ({ isEditing, onToggleEdit }: ProfileHeaderProps) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        logout();
        router.push('/login');
      },
    });
  };

  const getUserTypeLabel = () => {
    switch (user?.userType) {
      case 'job_seeker':
        return 'Người tìm việc';
      case 'freelancer':
        return 'Freelancer';
      case 'hr':
        return 'Nhà tuyển dụng';
      default:
        return user?.userType;
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative">
          <AvatarUpload
            userId={user?.id || 0}
            currentAvatar={user?.avatarUrl}
            onAvatarChange={() => {}}
            size={typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 100}
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h1>
          <p className="text-sm text-gray-600 mb-2 flex items-center justify-center md:justify-start gap-2">
            <MailOutlined /> {user?.email}
          </p>
          <div className="flex gap-2 justify-center md:justify-start flex-wrap">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {getUserTypeLabel()}
            </span>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={onToggleEdit}
            className="flex-1 md:flex-none"
          >
            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </Button>

          {user?.userType === 'hr' && (
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout} className="flex-1 md:flex-none">
              Thoát
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
