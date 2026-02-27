import { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { savedJobApi } from '@/lib/savedJobApi';
import { useAuthStore } from '@/store/useAuthStore';

interface SaveJobButtonProps {
  jobId: number;
  size?: 'small' | 'middle' | 'large';
  showText?: boolean;
}

export default function SaveJobButton({ 
  jobId, 
  size = 'middle',
  showText = true 
}: SaveJobButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (user && jobId) {
      checkSaved();
    }
  }, [user, jobId]);

  const checkSaved = async () => {
    if (!user) return;
    
    try {
      const isSaved = await savedJobApi.checkSaved(user.id, jobId);
      setSaved(isSaved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleToggle = async () => {
    if (!isAuthenticated || !user) {
      message.warning('Vui lòng đăng nhập để lưu việc làm');
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await savedJobApi.unsaveJob(user.id, jobId);
        setSaved(false);
        message.success('Đã bỏ lưu việc làm');
      } else {
        await savedJobApi.saveJob(user.id, jobId);
        setSaved(true);
        message.success('Đã lưu việc làm');
      }
    } catch (error: any) {
      if (error.response?.data?.error === 'Job already saved') {
        setSaved(true);
      } else {
        message.error('Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type={saved ? 'primary' : 'default'}
      icon={saved ? <HeartFilled /> : <HeartOutlined />}
      onClick={handleToggle}
      loading={loading}
      size={size}
      danger={saved}
    >
      {showText && (saved ? 'Đã lưu' : 'Lưu việc làm')}
    </Button>
  );
}
