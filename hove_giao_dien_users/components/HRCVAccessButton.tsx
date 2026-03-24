import React, { useState } from 'react';
import { Button, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { cvApi } from '../lib/cvApi';

interface HRCVAccessButtonProps {
  cvId: number;
  candidateUserId: number;
  hrId: number;
  candidateName?: string;
  buttonText?: string;
  type?: 'primary' | 'default' | 'link';
  size?: 'small' | 'middle' | 'large';
  showIcon?: boolean;
}

export const HRCVAccessButton: React.FC<HRCVAccessButtonProps> = ({
  cvId,
  candidateUserId,
  hrId,
  candidateName = 'Candidate',
  buttonText = 'Xem CV',
  type = 'default',
  size = 'small',
  showIcon = true
}) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cvUrl, setCvUrl] = useState('');

  const handleViewCV = async () => {
    try {
      setLoading(true);
      
      console.log('[HRCVAccessButton] Generating HR token for:', { 
        cvId, hrId, candidateUserId, candidateName 
      });

      // Generate HR token for secure access
      const tokenResponse = await cvApi.generateHRToken(cvId, hrId, candidateUserId);
      
      console.log('[HRCVAccessButton] Token response:', tokenResponse);

      // Mở CV trực tiếp từ backend trong tab mới
      const newWindow = window.open(tokenResponse.fullUrl, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        message.success(`Đang mở CV của ${candidateName}`);
      } else {
        // Trường hợp popup bị chặn
        message.warning('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
        
        // Fallback: copy URL to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(tokenResponse.fullUrl);
          message.info('URL CV đã được copy vào clipboard');
        }
      }

    } catch (error: any) {
      console.error('Error accessing CV:', error);
      
      const errorMessage = error.response?.data?.error || 'Không thể truy cập CV';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setCvUrl('');
  };

  return (
    <Button
      type={type}
      size={size}
      icon={showIcon ? <EyeOutlined /> : undefined}
      loading={loading}
      onClick={handleViewCV}
      title={`Xem CV của ${candidateName} - Truy cập bảo mật từ backend`}
    >
      {buttonText}
    </Button>
  );
};

export default HRCVAccessButton;