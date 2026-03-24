import { Form, Input, Button, message, Select, Row, Col, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, SaveOutlined, TagsOutlined, CompassOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { userApi } from '@/lib/userApi';
import { locationApi } from '@/lib/locationApi';
import { domainApi, Domain } from '@/lib/domainApi';
import CertificateUpload from '@/components/CertificateUpload';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface PersonalInfoFormProps {
  isEditing: boolean;
  onSaveSuccess?: () => void;
}

export const PersonalInfoForm = ({ isEditing, onSaveSuccess }: PersonalInfoFormProps) => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const { jobSeekerProfile, loading, loadJobSeekerProfile, saveJobSeekerProfile } = useProfileStore();
  const [gettingLocation, setGettingLocation] = useState(false);
  const [certificateImages, setCertificateImages] = useState('');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadDomains();
    }
  }, [user?.id]);

  const loadDomains = async () => {
    setLoadingDomains(true);
    try {
      const activeDomains = await domainApi.getActiveDomains();
      setDomains(activeDomains);
    } catch (error) {
      console.error('Error loading domains:', error);
      message.error('Không thể tải danh sách lĩnh vực');
    } finally {
      setLoadingDomains(false);
    }
  };

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      // Đợi loadJobSeekerProfile hoàn thành trước
      await loadJobSeekerProfile(user.id);
      const userData = await userApi.getUser(user.id);

      // Lấy dữ liệu mới nhất từ store sau khi đợi
      const { jobSeekerProfile: latestJobSeekerProfile } = useProfileStore.getState();

      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: latestJobSeekerProfile?.phone || userData.phone || '',
        location: latestJobSeekerProfile?.location || '',
        bio: latestJobSeekerProfile?.bio || userData.bio || '',
        currentPosition: userData.currentPosition || '',
        hometown: userData.hometown || '',
        currentLocation: userData.currentLocation || '',
        domainId: userData.domainId || undefined,
      });

      setCertificateImages(userData.certificateImages || '');
    } catch (error) {
      console.error('Load profile error:', error);
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
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      form.setFieldsValue({ currentLocation: locationString });

      if (user?.id) {
        try {
          await locationApi.updateLocation(user.id, {
            latitude,
            longitude,
            address: locationString,
          });
          message.success({
            content: `Đã lưu vị trí: ${locationString}`,
            key: 'location',
            duration: 3,
          });
        } catch (saveError) {
          message.success({
            content: `Đã lấy vị trí: ${locationString}`,
            key: 'location',
            duration: 3,
          });
        }
      }
    } catch (error: any) {
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

    try {
      await saveJobSeekerProfile(user.id, {
        phone: values.phone,
        location: values.location,
        bio: values.bio,
      });

      await userApi.updateUser(user.id, {
        name: values.name,
        currentPosition: values.currentPosition,
        hometown: values.hometown,
        currentLocation: values.currentLocation,
        phone: values.phone,
        bio: values.bio,
        certificateImages,
        domainId: values.domainId,
      });

      // Cập nhật lại user trong auth store để giữ liệu đồng bộ
      const { updateUser } = useAuthStore.getState();
      updateUser({
        ...user,
        name: values.name,
      });

      message.success('Cập nhật hồ sơ thành công!');
      onSaveSuccess?.();
    } catch (error) {
      message.error('Cập nhật thất bại!');
    }
  };

  if (loading && !jobSeekerProfile) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label={<Space><UserOutlined style={{ color: '#16a34a' }} /> Họ và tên</Space>} name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 12 }} disabled={!isEditing} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<Space><MailOutlined style={{ color: '#16a34a' }} /> Email</Space>} name="email" rules={[{ required: true, type: 'email' }]}>
            <Input style={{ borderRadius: 12 }} disabled />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<Space><UserOutlined style={{ color: '#16a34a' }} /> Vị trí công việc hiện tại</Space>} name="currentPosition">
            <Input
              placeholder="VD: Senior Frontend Developer"
              style={{ borderRadius: 12 }}
              disabled={!isEditing}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label={<Space><PhoneOutlined style={{ color: '#16a34a' }} /> Số điện thoại</Space>} name="phone">
            <Input placeholder="VD: 0123456789" style={{ borderRadius: 12 }} disabled={!isEditing} />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item 
            label={<Space><TagsOutlined style={{ color: '#16a34a' }} /> Lĩnh vực quan tâm</Space>} 
            name="domainId"
            rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực quan tâm!' }]}
          >
            <Select
              placeholder="Chọn lĩnh vực bạn quan tâm"
              disabled={!isEditing}
              loading={loadingDomains}
              style={{ borderRadius: 12 }}
              dropdownStyle={{ borderRadius: 12 }}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {domains.map(domain => (
                <Option key={domain.id} value={domain.id}>
                  {domain.name}
                  {domain.description && (
                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                      - {domain.description}
                    </Text>
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 0]}>
        <Col xs={24} md={12}>
          <Form.Item label={<Space><EnvironmentOutlined style={{ color: '#16a34a' }} /> Quê quán</Space>} name="hometown">
            <Input
              placeholder="VD: Hà Nội, TP. Hồ Chí Minh"
              style={{ borderRadius: 12 }}
              disabled={!isEditing}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space><CompassOutlined style={{ color: '#16a34a' }} /> Vị trí hiện tại</Space>
                {isEditing && (
                  <Button
                    type="link"
                    size="small"
                    icon={<EnvironmentOutlined />}
                    onClick={handleGetCurrentLocation}
                    loading={gettingLocation}
                    style={{ padding: 0, height: 'auto', fontWeight: 600, color: '#16a34a' }}
                  >
                    Lấy GPS
                  </Button>
                )}
              </Space>
            }
            name="currentLocation"
            extra={isEditing ? <Text type="secondary" style={{ fontSize: 11 }}>Nhấn 'Lấy GPS' để tự động cập nhật vị trí</Text> : undefined}
          >
            <Input
              placeholder="Hoặc nhập thủ công địa chỉ"
              style={{ borderRadius: 12 }}
              disabled={!isEditing}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label={<Space><UserOutlined style={{ color: '#16a34a' }} /> Giới thiệu bản thân</Space>} name="bio">
        <TextArea rows={4} placeholder="Viết vài dòng về bản thân, kỹ năng và mục tiêu của bạn..." style={{ borderRadius: 12, padding: '12px' }} disabled={!isEditing} />
      </Form.Item>

      {isEditing && (
        <Form.Item
          label={
            <Text strong style={{ color: '#ef4444' }}>
              Ảnh chứng chỉ / Bằng cấp * (Bắt buộc để ứng tuyển Freelance)
            </Text>
          }
        >
          <div style={{ padding: '16px', background: '#fff1f0', borderRadius: 16, border: '1px dashed #ffa39e' }}>
            <CertificateUpload
              userId={user?.id || 0}
              currentImages={certificateImages}
              onImagesChange={setCertificateImages}
            />
          </div>
        </Form.Item>
      )}

      {isEditing && (
        <Form.Item style={{ marginTop: 32 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            icon={<SaveOutlined />} 
            loading={loading}
            style={{ 
              height: 48, 
              borderRadius: 12, 
              padding: '0 32px', 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none',
              boxShadow: '0 8px 16px rgba(22,163,74,0.2)'
            }}
          >
            Lưu thay đổi hồ sơ
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};
