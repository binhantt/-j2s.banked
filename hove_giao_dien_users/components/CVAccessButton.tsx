import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { cvApi } from '../lib/cvApi';
import { CVSecurity, useCVSecurity } from '../lib/cvSecurity';

interface CVAccessButtonProps {
  cvId: number;
  candidateUserId: number;
  hrId: number;
  candidateName?: string;
  buttonText?: string;
  type?: 'primary' | 'default' | 'link';
  size?: 'small' | 'middle' | 'large';
  openInNewTab?: boolean; // Thêm option để chọn cách mở
}

export const CVAccessButton: React.FC<CVAccessButtonProps> = ({
  cvId,
  candidateUserId,
  hrId,
  candidateName = 'Candidate',
  buttonText = 'View CV',
  type = 'primary',
  size = 'middle',
  openInNewTab = true // Mặc định mở trong tab mới
}) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const { validateBasicAccess, validateAccess, logSecurityEvent } = useCVSecurity();

  const handleViewCV = async () => {
    try {
      setLoading(true);
      
      // Basic parameter validation trước khi gọi API
      if (!validateBasicAccess(cvId, hrId)) {
        message.error('Invalid access parameters');
        return;
      }
      
      if (!candidateUserId) {
        message.error('Missing candidate information');
        return;
      }
      
      logSecurityEvent('CV_ACCESS_ATTEMPT', {
        cvId, hrId, candidateUserId, candidateName
      });
      
      console.log('Generating HR token for:', { cvId, hrId, candidateUserId });
      
      // Generate HR access token
      const tokenResponse = await cvApi.generateHRToken(cvId, hrId, candidateUserId);
      
      console.log('Token response:', tokenResponse);
      
      // Additional security validation sau khi có token
      if (!CVSecurity.isValidTokenFormat(tokenResponse.token)) {
        logSecurityEvent('INVALID_TOKEN_RECEIVED', {
          cvId, tokenLength: tokenResponse.token?.length
        });
        message.error('Invalid security token received');
        return;
      }
      
      // Validate access với token thực
      if (!validateAccess(cvId, hrId, tokenResponse.token)) {
        logSecurityEvent('ACCESS_VALIDATION_FAILED', {
          cvId, hrId, candidateUserId
        });
        message.error('Access validation failed');
        return;
      }
      
      logSecurityEvent('CV_ACCESS_GRANTED', {
        cvId, hrId, candidateUserId, tokenExpiry: tokenResponse.expiresIn
      });
      
      if (openInNewTab) {
        // Mở CV trong tab mới
        window.open(tokenResponse.fullUrl, '_blank', 'noopener,noreferrer');
        message.success(`Đang mở CV của ${candidateName} trong tab mới`);
      } else {
        // Hiển thị trong modal (cách cũ)
        setCvUrl(tokenResponse.fullUrl);
        setModalVisible(true);
        message.success('CV access granted successfully');
      }
      
    } catch (error: any) {
      console.error('Error accessing CV:', error);
      console.error('Error details:', error.response?.data);
      
      logSecurityEvent('CV_ACCESS_DENIED', {
        cvId, hrId, candidateUserId, 
        error: error.response?.data?.error || error.message
      });
      
      message.error(error.response?.data?.error || 'Failed to access CV');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setCvUrl(null);
    
    logSecurityEvent('CV_MODAL_CLOSED', {
      cvId, hrId, candidateUserId
    });
  };

  return (
    <>
      <Button
        type={type}
        size={size}
        icon={<FileTextOutlined />}
        loading={loading}
        onClick={handleViewCV}
      >
        {buttonText}
      </Button>

      {/* Modal chỉ hiển thị khi openInNewTab = false */}
      {!openInNewTab && (
        <Modal
          title={`CV - ${candidateName}`}
          open={modalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Close
            </Button>
          ]}
          width="90%"
          style={{ top: 20 }}
          styles={{ body: { height: '80vh', padding: 0 } }}
        >
          {cvUrl ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px', background: '#f0f0f0', fontSize: '12px', color: '#666' }}>
                Debug URL: {cvUrl}
              </div>
              <iframe
                src={cvUrl}
                width="100%"
                height="100%"
                title={`CV of ${candidateName}`}
                style={{ border: 'none', flex: 1 }}
                onLoad={() => console.log('Iframe loaded successfully')}
                onError={() => console.error('Iframe failed to load')}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              Loading CV...
            </div>
          )}
        </Modal>
      )}
    </>
  );
};

export default CVAccessButton;