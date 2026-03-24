import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

const { Text, Paragraph } = Typography;

export const CompanyDebugInfo = () => {
  const { user } = useAuthStore();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkCompanyInfo = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const results: any = {};
      
      // Test regular endpoint first
      try {
        const regularResponse = await api.get(`/api/companies/hr/${user.id}`);
        console.log('Regular response:', regularResponse.data);
        results.regular = regularResponse.data;
      } catch (regularError: any) {
        console.log('Regular endpoint error:', regularError.response?.data);
        results.regularError = regularError.response?.data || regularError.message;
      }
      
      // Test with-domain endpoint
      try {
        const domainResponse = await api.get(`/api/companies/hr/${user.id}/with-domain`);
        console.log('Domain response:', domainResponse.data);
        results.withDomain = domainResponse.data;
      } catch (domainError: any) {
        console.log('Domain endpoint error:', domainError.response?.data);
        results.domainError = domainError.response?.data || domainError.message;
      }
      
      // Test debug endpoint (optional)
      try {
        const debugResponse = await api.get(`/api/companies/debug/${user.id}`);
        console.log('Debug response:', debugResponse.data);
        results.debug = debugResponse.data;
      } catch (debugError: any) {
        console.log('Debug endpoint error (expected if backend not restarted):', debugError.response?.status);
        results.debugError = `Debug endpoint not available (${debugError.response?.status})`;
      }
      
      setDebugInfo(results);
      
    } catch (error: any) {
      console.error('Error:', error);
      setDebugInfo({
        error: error.response?.data || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Company Debug Info" style={{ margin: '20px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={checkCompanyInfo} loading={loading}>
          Check Company Info (HR ID: {user?.id})
        </Button>
        
        {debugInfo && (
          <div>
            <Text strong>Debug Results:</Text>
            <Paragraph>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </Paragraph>
          </div>
        )}
      </Space>
    </Card>
  );
};