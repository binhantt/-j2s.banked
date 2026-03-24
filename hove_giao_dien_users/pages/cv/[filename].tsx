import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card, Spin, Alert, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function SharedCVPage() {
  const router = useRouter();
  const { filename } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (filename) {
      // Tự động load CV khi có filename
      setLoading(false);
    }
  }, [filename]);

  const cvUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/cv/${filename}?allowShare=true`;

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Alert
          message="Không thể tải CV"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/')}>
              Về trang chủ
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '16px 24px', 
        borderBottom: '1px solid #d9d9d9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/')}
            style={{ marginRight: 16 }}
          >
            Về trang chủ
          </Button>
          <h2 style={{ margin: 0, color: '#1890ff' }}>
            CV được chia sẻ
          </h2>
        </div>
      </div>

      {/* CV Viewer */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <p style={{ color: '#666', margin: 0 }}>
              Đây là CV được chia sẻ công khai. Bạn có thể xem và tải xuống.
            </p>
          </div>
          
          <div style={{ 
            width: '100%', 
            height: '80vh', 
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            overflow: 'hidden'
          }}>
            <iframe
              src={cvUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Shared CV"
            />
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="primary" href={cvUrl} target="_blank">
              Tải xuống CV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}