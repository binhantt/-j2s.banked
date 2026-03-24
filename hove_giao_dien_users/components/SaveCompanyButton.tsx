import { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { savedCompanyApi } from '@/lib/savedCompanyApi';
import { useAuthStore } from '@/store/useAuthStore';

interface SaveCompanyButtonProps {
  companyId: number;
  size?: 'small' | 'middle' | 'large';
  showText?: boolean;
}

export default function SaveCompanyButton({ 
  companyId, 
  size = 'middle',
  showText = true 
}: SaveCompanyButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (user && companyId) {
      checkSaved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, companyId]);

  const checkSaved = async () => {
    if (!user) return;
    
    try {
      const isSaved = await savedCompanyApi.checkSaved(user.id, companyId);
      setSaved(isSaved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleToggle = async () => {
    if (!isAuthenticated || !user) {
      message.warning('Vui lòng đăng nhập để lưu công ty');
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await savedCompanyApi.unsaveCompany(user.id, companyId);
        setSaved(false);
        message.success('Đã bỏ lưu công ty');
      } else {
        await savedCompanyApi.saveCompany(user.id, companyId);
        setSaved(true);
        message.success('Đã lưu công ty');
      }
    } catch (error: any) {
      if (error.response?.data?.error === 'Company already saved') {
        setSaved(true);
      } else {
        const msg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
        console.error('❌ Lỗi khi lưu/bỏ lưu công ty:', msg);
        message.error(`Không thể lưu công ty: ${msg}`);
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
      {showText && (saved ? 'Đã lưu' : 'Lưu công ty')}
    </Button>
  );
}
