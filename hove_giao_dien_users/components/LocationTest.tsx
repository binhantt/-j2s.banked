import { useState } from 'react';
import { Button, Card, message, Space, Typography } from 'antd';
import { AimOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export default function LocationTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testGeolocation = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ Geolocation API');
      setLoading(false);
      return;
    }

    console.log('Starting geolocation request...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('Success:', pos);
            resolve(pos);
          },
          (err) => {
            console.error('Error:', err);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      setResult({
        latitude,
        longitude,
        accuracy,
        timestamp: new Date(position.timestamp).toLocaleString('vi-VN')
      });

      // Try geocoding
      try {
        console.log('Trying geocoding...');
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`,
          {
            headers: {
              'User-Agent': 'JobPortalApp/1.0'
            }
          }
        );
        
        const data = await response.json();
        console.log('Geocoding result:', data);
        
        setResult((prev: any) => ({
          ...prev,
          address: data.display_name,
          addressDetails: data.address
        }));
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        setResult((prev: any) => ({
          ...prev,
          geocodeError: 'Không thể chuyển đổi tọa độ thành địa chỉ'
        }));
      }

      message.success('Lấy vị trí thành công!');
    } catch (err: any) {
      console.error('Geolocation error:', err);
      
      let errorMsg = 'Lỗi không xác định';
      if (err.code === 1) {
        errorMsg = 'PERMISSION_DENIED: Người dùng từ chối quyền truy cập vị trí';
      } else if (err.code === 2) {
        errorMsg = 'POSITION_UNAVAILABLE: Không thể xác định vị trí';
      } else if (err.code === 3) {
        errorMsg = 'TIMEOUT: Hết thời gian chờ';
      }
      
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Test Geolocation API" style={{ maxWidth: 600, margin: '20px auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Button
          type="primary"
          icon={<AimOutlined />}
          onClick={testGeolocation}
          loading={loading}
          size="large"
          block
        >
          {loading ? 'Đang lấy vị trí...' : 'Test Lấy Vị Trí'}
        </Button>

        {error && (
          <Card type="inner" title="❌ Lỗi" style={{ background: '#fff2f0' }}>
            <Text type="danger">{error}</Text>
            <Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
              <strong>Cách khắc phục:</strong>
              <ul>
                <li>Kiểm tra xem bạn đã cho phép truy cập vị trí trong trình duyệt chưa</li>
                <li>Đảm bảo đang dùng HTTPS hoặc localhost</li>
                <li>Thử refresh trang và cho phép lại</li>
                <li>Kiểm tra cài đặt vị trí trong hệ điều hành</li>
              </ul>
            </Paragraph>
          </Card>
        )}

        {result && (
          <Card type="inner" title="✅ Kết quả" style={{ background: '#f6ffed' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Vĩ độ: </Text>
                <Text>{result.latitude}</Text>
              </div>
              <div>
                <Text strong>Kinh độ: </Text>
                <Text>{result.longitude}</Text>
              </div>
              <div>
                <Text strong>Độ chính xác: </Text>
                <Text>{result.accuracy} mét</Text>
              </div>
              <div>
                <Text strong>Thời gian: </Text>
                <Text>{result.timestamp}</Text>
              </div>
              {result.address && (
                <div>
                  <Text strong>Địa chỉ: </Text>
                  <Paragraph>{result.address}</Paragraph>
                </div>
              )}
              {result.geocodeError && (
                <div>
                  <Text type="warning">{result.geocodeError}</Text>
                </div>
              )}
            </Space>
          </Card>
        )}

        <Card type="inner" title="ℹ️ Thông tin">
          <ul style={{ marginBottom: 0 }}>
            <li>Geolocation API chỉ hoạt động trên HTTPS hoặc localhost</li>
            <li>Bạn cần cho phép truy cập vị trí khi trình duyệt hỏi</li>
            <li>Độ chính xác phụ thuộc vào thiết bị và môi trường</li>
            <li>Có thể mất vài giây để lấy vị trí chính xác</li>
          </ul>
        </Card>
      </Space>
    </Card>
  );
}
