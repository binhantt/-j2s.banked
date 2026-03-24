import React, { useState, useEffect } from 'react';
import { Button, message, Card, Typography, Space } from 'antd';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { cvApi } from '../lib/cvApi';

const { Title, Text } = Typography;

interface HRCVViewerProps {
  cvId: number;
  candidateUserId: number;
  hrId: number;
  candidateName?: string;
  cvFileName?: string;
}

export const HRCVViewer: React.FC<HRCVViewerProps> = ({
  cvId,
  candidateUserId,
  hrId,
  candidateName = 'Candidate',
  cvFileName
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewCV = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[HRCVViewer] Generating HR token for:', { cvId, hrId, candidateUserId });

      // Generate HR token for secure access
      const tokenResponse = await cvApi.generateHRToken(cvId, hrId, candidateUserId);
      
      console.log('[HRCVViewer] Token response:', tokenResponse);

      // Mở CV trong tab mới với token bảo mật
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

    } catch (err: any) {
      console.error('Error generating HR access:', err);
      const errorMessage = err.response?.data?.error || 'Không thể truy cập CV';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      size="small"
      title={
        <Space>
          <FileTextOutlined />
          <span>CV của {candidateName}</span>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<EyeOutlined />}
          loading={loading}
          onClick={handleViewCV}
          size="small"
        >
          Xem CV
        </Button>
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text type="secondary">
          <strong>Candidate ID:</strong> {candidateUserId}
        </Text>
        <Text type="secondary">
          <strong>CV ID:</strong> {cvId}
        </Text>
        {cvFileName && (
          <Text type="secondary">
            <strong>File:</strong> {cvFileName}
          </Text>
        )}
        
        {error && (
          <Text type="danger" style={{ fontSize: '12px' }}>
            {error}
          </Text>
        )}
        
        <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
          <Text type="secondary">
            🔒 Truy cập bảo mật với token một lần sử dụng
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default HRCVViewer;