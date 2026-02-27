import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Space, Alert } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  AimOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { locationApi } from '@/lib/locationApi';
import CertificateUpload from '@/components/CertificateUpload';

const { TextArea } = Input;

export default function PersonalInfoForm() {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [certificateImages, setCertificateImages] = useState('');
  const [savedLocation, setSavedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    updatedAt?: string;
  } | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      const response = await api.get(`/api/users/${user!.id}`);
      const userData = response.data;
      
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        currentPosition: userData.currentPosition || '',
        hometown: userData.hometown || '',
        currentLocation: userData.currentLocation || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
      });
      
      setCertificateImages(userData.certificateImages || '');
      
      // Load saved location coordinates
      if (userData.currentLatitude && userData.currentLongitude) {
        setSavedLocation({
          latitude: userData.currentLatitude,
          longitude: userData.currentLongitude,
          address: userData.currentLocation || '',
          updatedAt: userData.locationUpdatedAt,
        });
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      message.error('Trình duyệt không hỗ trợ định vị!');
      return;
    }

    setGettingLocation(true);
    message.loading({ content: 'Đang lấy vị trí...', key: 'location' });
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('Got coordinates:', latitude, longitude);
      
      // Try to get address from OpenStreetMap Nominatim API
      let locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`,
          {
            headers: {
              'User-Agent': 'JobPortalApp/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.address) {
            const parts = [];
            if (data.address.road) parts.push(data.address.road);
            if (data.address.suburb || data.address.neighbourhood) parts.push(data.address.suburb || data.address.neighbourhood);
            if (data.address.city || data.address.town) parts.push(data.address.city || data.address.town);
            if (data.address.state) parts.push(data.address.state);
            
            locationString = parts.length > 0 ? parts.join(', ') : data.display_name;
          } else if (data.display_name) {
            locationString = data.display_name;
          }
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
      }
      
      form.setFieldsValue({ currentLocation: locationString });
      
      // Save to database
      if (user?.id) {
        try {
          await locationApi.updateLocation(user.id, {
            latitude,
            longitude,
            address: locationString
          });
          
          // Update saved location state
          setSavedLocation({
            latitude,
            longitude,
            address: locationString,
            updatedAt: new Date().toISOString(),
          });
          
          message.success({ content: 'Đã lưu vị trí hiện tại!', key: 'location' });
        } catch (saveError) {
          console.error('Save location error:', saveError);
          message.warning('Đã lấy vị trí nhưng chưa lưu được');
        }
      }
    } catch (error: any) {
      console.error('Geolocation error:', error);
      message.destroy('location');
      
      if (error.code === 1) {
        message.error('Bạn cần cho phép truy cập vị trí trong trình duyệt!');
      } else if (error.code === 2) {
        message.error('Không thể xác định vị trí. Vui lòng nhập thủ công.');
      } else if (error.code === 3) {
        message.error('Hết thời gian chờ. Vui lòng thử lại.');
      } else {
        message.error('Lỗi khi lấy vị trí. Vui lòng nhập thủ công.');
      }
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await api.put(`/api/users/${user.id}`, {
        ...values,
        certificateImages,
      });
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Update error:', error);
      message.error('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input size="large" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input size="large" prefix={<MailOutlined />} disabled />
          </Form.Item>

          <Form.Item
            label="Vị trí công việc hiện tại"
            name="currentPosition"
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="VD: Senior Frontend Developer"
            />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input
              size="large"
              prefix={<PhoneOutlined />}
              placeholder="VD: 0123456789"
            />
          </Form.Item>

          <Form.Item
            label="Quê quán (vị trí cố định)"
            name="hometown"
          >
            <Input
              size="large"
              prefix={<EnvironmentOutlined />}
              placeholder="VD: Hà Nội, TP. Hồ Chí Minh"
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <span>Vị trí hiện tại</span>
                <Button
                  type="link"
                  size="small"
                  icon={<AimOutlined />}
                  onClick={handleGetCurrentLocation}
                  loading={gettingLocation}
                  style={{ padding: 0, height: 'auto' }}
                >
                  {gettingLocation ? 'Đang lấy...' : 'Lấy GPS'}
                </Button>
              </Space>
            }
            name="currentLocation"
            extra="Nhấn 'Lấy GPS' để tự động lấy vị trí hiện tại"
          >
            <Input
              size="large"
              prefix={<EnvironmentOutlined />}
              placeholder="Hoặc nhập thủ công"
            />
          </Form.Item>
        </div>

        {/* Google Map Display */}
        {savedLocation && (
          <Card 
            title={
              <Space>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <span>Vị trí đã lưu trên bản đồ</span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Alert
              message={
                <div>
                  <div><strong>📍 Địa chỉ:</strong> {savedLocation.address}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                    <strong>Tọa độ:</strong> {savedLocation.latitude.toFixed(6)}, {savedLocation.longitude.toFixed(6)}
                  </div>
                  {savedLocation.updatedAt && (
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                      <strong>Cập nhật:</strong> {new Date(savedLocation.updatedAt).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ 
              width: '100%', 
              height: 400, 
              borderRadius: 8,
              overflow: 'hidden',
              border: '2px solid #e8e8e8'
            }}>
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${savedLocation.latitude},${savedLocation.longitude}&zoom=15`}
              />
            </div>
            
            <div style={{ 
              marginTop: 12, 
              padding: 12, 
              background: '#f0f5ff',
              borderRadius: 8,
              fontSize: 13
            }}>
              <Space split="|">
                <a 
                  href={`https://www.google.com/maps?q=${savedLocation.latitude},${savedLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1890ff' }}
                >
                  🗺️ Mở trong Google Maps
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${savedLocation.latitude},${savedLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1890ff' }}
                >
                  🧭 Chỉ đường
                </a>
              </Space>
            </div>
          </Card>
        )}

        <Form.Item label="Giới thiệu bản thân" name="bio">
          <TextArea
            rows={4}
            placeholder="Viết vài dòng về bản thân, kinh nghiệm làm việc..."
          />
        </Form.Item>

        <Form.Item label={
          <span>
            Ảnh chứng chỉ / Bằng cấp{' '}
            <span style={{ color: '#ff4d4f' }}>* Bắt buộc để ứng tuyển</span>
          </span>
        }>
          <CertificateUpload
            userId={user?.id || 0}
            currentImages={certificateImages}
            onImagesChange={setCertificateImages}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
            loading={loading}
            block
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
