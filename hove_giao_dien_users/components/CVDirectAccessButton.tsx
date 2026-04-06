import React, { useState } from 'react';
import { Button, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { cvApi } from '../lib/cvApi';
import { CVSecurity, useCVSecurity } from '../lib/cvSecurity';

interface CVDirectAccessButtonProps {
  cvId: number;
  candidateUserId: number;
  hrId: number;
  candidateName?: string;
  buttonText?: string;
  type?: 'primary' | 'default' | 'link';
  size?: 'small' | 'middle' | 'large';
  showIcon?: boolean;
}

export const CVDirectAccessButton: React.FC<CVDirectAccessButtonProps> = ({
  cvId,
  candidateUserId,
  hrId,
  candidateName = 'Candidate',
  buttonText = 'Xem CV',
  type = 'primary',
  size = 'middle',
  showIcon = true
}) => {
  const [loading, setLoading] = useState(false);
  const { validateBasicAccess, validateAccess, logSecurityEvent } = useCVSecurity();

  const handleViewCV = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!validateBasicAccess(cvId, hrId)) {
        message.error('Thông tin truy cập không hợp lệ');
        return;
      }
      
      if (!candidateUserId) {
        message.error('Thiếu thông tin ứng viên');
        return;
      }
      
      logSecurityEvent('CV_DIRECT_ACCESS_ATTEMPT', {
        cvId, hrId, candidateUserId, candidateName
      });
      
      try {
        // Thử generate HR access token
        const tokenResponse = await cvApi.generateHRToken(cvId, hrId, candidateUserId);
        
        // Security validation
        if (!CVSecurity.isValidTokenFormat(tokenResponse.token)) {
          logSecurityEvent('INVALID_TOKEN_RECEIVED', {
            cvId, tokenLength: tokenResponse.token?.length
          });
          throw new Error('Invalid token format');
        }
        
        // Mở CV với token
        const newWindow = window.open(tokenResponse.fullUrl, '_blank', 'noopener,noreferrer');
        
        if (newWindow) {
          logSecurityEvent('CV_OPENED_WITH_TOKEN', {
            cvId, hrId, candidateUserId, tokenExpiry: tokenResponse.expiresIn
          });
          message.success(`Đang mở CV của ${candidateName}`);
        } else {
          throw new Error('Popup blocked');
        }
        
      } catch (tokenError) {
        console.warn('Token generation failed:', tokenError);
        message.error('Không thể tạo quyền truy cập CV. Vui lòng thử lại sau.');
        return;
      }
      
    } catch (error: any) {
      console.error('Error accessing CV:', error);
      
      logSecurityEvent('CV_ACCESS_DENIED', {
        cvId, hrId, candidateUserId, 
        error: error.message
      });
      
      message.error('Không thể truy cập CV: ' + error.message);
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
      title={`Mở CV của ${candidateName} trong tab mới`}
    >
      {buttonText}
    </Button>
  );
};

export default CVDirectAccessButton;