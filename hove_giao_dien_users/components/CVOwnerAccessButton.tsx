import React, { useState } from 'react';
import { Button, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { cvApi } from '../lib/cvApi';
import { useCVSecurity } from '../lib/cvSecurity';

interface CVOwnerAccessButtonProps {
  cvId: number;
  userId: number;
  cvTitle?: string;
  buttonText?: string;
  type?: 'primary' | 'default' | 'link';
  size?: 'small' | 'middle' | 'large';
  showIcon?: boolean;
}

export const CVOwnerAccessButton: React.FC<CVOwnerAccessButtonProps> = ({
  cvId,
  userId,
  cvTitle = 'CV',
  buttonText = 'Xem CV',
  type = 'primary',
  size = 'middle',
  showIcon = true
}) => {
  const [loading, setLoading] = useState(false);
  const { validateBasicAccess, logSecurityEvent } = useCVSecurity();

  const handleViewCV = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!validateBasicAccess(cvId, userId)) {
        message.error('Thông tin truy cập không hợp lệ');
        return;
      }
      
      logSecurityEvent('CV_OWNER_ACCESS_ATTEMPT', {
        cvId, userId, cvTitle
      });
      
      console.log('[CVOwnerAccessButton] Generating token for CV:', cvId, 'User:', userId);
      
      // Generate owner access token
      const tokenResponse = await cvApi.generateOwnerToken(cvId, userId);
      
      console.log('[CVOwnerAccessButton] Token response:', tokenResponse);
      
      // Mở CV trực tiếp từ backend trong tab mới
      const newWindow = window.open(tokenResponse.fullUrl, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        logSecurityEvent('CV_OWNER_OPENED_IN_NEW_TAB', {
          cvId, userId, tokenExpiry: tokenResponse.expiresIn
        });
        message.success(`Đang mở ${cvTitle}`);
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
      
      logSecurityEvent('CV_OWNER_ACCESS_DENIED', {
        cvId, userId, 
        error: error.response?.data?.error || error.message
      });
      
      const errorMessage = error.response?.data?.error || 'Không thể truy cập CV';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type={type}
      size={size}
      icon={showIcon ? <ExportOutlined /> : undefined}
      loading={loading}
      onClick={handleViewCV}
      title={`Xem ${cvTitle} - Truy cập bảo mật từ backend`}
    >
      {buttonText}
    </Button>
  );
};

export default CVOwnerAccessButton;
