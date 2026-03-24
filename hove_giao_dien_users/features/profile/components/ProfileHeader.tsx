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
    <Card 
      style={{ 
        borderRadius: 24, 
        marginBottom: 24, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
        border: '1px solid #f1f5f9',
        padding: '12px 0'
      }}
    >
      <div style={{ display: 'flex', flexDirection: typeof window !== 'undefined' && window.innerWidth < 768 ? 'column' : 'row', alignItems: 'center', gap: 24, padding: '0 24px' }}>
        <div style={{ position: 'relative' }}>
          <AvatarUpload
            userId={user?.id || 0}
            currentAvatar={user?.avatarUrl}
            onAvatarChange={() => {}}
            size={typeof window !== 'undefined' && window.innerWidth < 640 ? 90 : 110}
          />
        </div>

        <div style={{ flex: 1, textAlign: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'left' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>
            {user?.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'flex-start', gap: 8 }}>
            <MailOutlined style={{ color: '#16a34a' }} /> {user?.email}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: typeof window !== 'undefined' && window.innerWidth < 768 ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '4px 12px', 
              background: '#f0fdf4', 
              color: '#16a34a', 
              borderRadius: 100, 
              fontSize: 12, 
              fontWeight: 600,
              border: '1px solid #dcfce7'
            }}>
              {getUserTypeLabel()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto' }}>
          <Button
            type="primary"
            icon={<EditOutlined rotate={isEditing ? 45 : 0} />}
            onClick={onToggleEdit}
            style={{ 
              height: 44, 
              borderRadius: 12, 
              padding: '0 24px',
              fontWeight: 700,
              background: isEditing ? '#64748b' : 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none',
              boxShadow: isEditing ? 'none' : '0 4px 12px rgba(22,163,74,0.2)',
              flex: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 'none'
            }}
          >
            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </Button>

          {user?.userType === 'hr' && (
            <Button 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout} 
              style={{ 
                height: 44, 
                borderRadius: 12, 
                fontWeight: 600,
                flex: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 'none'
              }}
            >
              Thoát
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
