import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { locationApi } from '@/lib/locationApi';
import CertificateUpload from '@/components/CertificateUpload';

const { TextArea } = Input;

export default function ProfileForm() {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [certificateImages, setCertificateImages] = useState('');

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
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`,
          {
            headers: {
              'User-Agent': 'JobPortalApp/1.0'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Geocoding failed');
        }
        
        const data = await response.json();
        console.log('Geocoding result:', data);
        
        if (data.display_name) {
          // Extract meaningful address parts
          const address = data.address;
          let locationString = '';
          
          if (address) {
            // Build address from parts
            const parts = [];
            if (address.road) parts.push(address.road);
            if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
            if (address.city || address.town) parts.push(address.city || address.town);
            if (address.state) parts.push(address.state);
            if (address.country) parts.push(address.country);
            
            locationString = parts.length > 0 ? parts.join(', ') : data.display_name;
          } else {
            locationString = data.display_name;
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
              message.success({ content: 'Đã lưu vị trí hiện tại!', key: 'location' });
            } catch (saveError) {
              console.error('Save location error:', saveError);
              message.warning('Đã lấy vị trí nhưng chưa lưu được vào database');
            }
          }
        } else {
          // Fallback to coordinates
          const coordString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          form.setFieldsValue({ currentLocation: coordString });
          
          // Save coordinates to database
          if (user?.id) {
            try {
              await locationApi.updateLocation(user.id, {
                latitude,
                longitude,
                address: coordString
              });
              message.success({ content: 'Đã lưu tọa độ vị trí!', key: 'location' });
            } catch (saveError) {
              console.error('Save location error:', saveError);
              message.warning('Đã lấy tọa độ nhưng chưa lưu được vào database');
            }
          }
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        // If geocoding fails, just use coordinates
        const coordString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        form.setFieldsValue({ currentLocation: coordString });
        
        // Save coordinates to database
        if (user?.id) {
          try {
            await locationApi.updateLocation(user.id, {
              latitude,
              longitude,
              address: coordString
            });
            message.success({ content: 'Đã lưu tọa độ vị trí!', key: 'location' });
          } catch (saveError) {
            console.error('Save location error:', saveError);
            message.warning('Đã lấy tọa độ nhưng chưa lưu được vào database');
          }
        }
      }
    } catch (error: any) {
      console.error('Geolocation error:', error);
      message.destroy('location');
      
      if (error.code === 1) {
        message.error({
          content: 'Bạn cần cho phép truy cập vị trí trong trình duyệt!',
          duration: 5
        });
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
    <Card title="Thông tin cá nhân">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input size="large" prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
        >
          <Input size="large" prefix={<MailOutlined />} disabled />
        </Form.Item>

        <Form.Item
          label="Vị trí công việc hiện tại"
          name="currentPosition"
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="VD: Senior Frontend Developer, Product Manager"
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
            <span>
              Vị trí hiện tại (nơi đang làm việc){' '}
              <Button
                type="link"
                size="small"
                icon={<AimOutlined />}
                onClick={handleGetCurrentLocation}
                loading={gettingLocation}
                style={{ padding: 0 }}
              >
                {gettingLocation ? 'Đang lấy...' : 'Lấy vị trí GPS'}
              </Button>
            </span>
          }
          name="currentLocation"
          extra="Nhấn nút 'Lấy vị trí GPS' và cho phép truy cập vị trí trong trình duyệt"
        >
          <Input
            size="large"
            prefix={<EnvironmentOutlined />}
            placeholder="Hoặc nhập thủ công: VD: Quận 1, TP.HCM"
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
        >
          <Input
            size="large"
            prefix={<PhoneOutlined />}
            placeholder="VD: 0123456789"
          />
        </Form.Item>

        <Form.Item
          label="Giới thiệu bản thân"
          name="bio"
        >
          <TextArea
            rows={4}
            placeholder="Viết vài dòng về bản thân, kinh nghiệm làm việc..."
          />
        </Form.Item>

        <Form.Item label="Ảnh chứng chỉ / Bằng cấp (Bắt buộc để ứng tuyển)">
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
