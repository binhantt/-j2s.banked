import { Form, Input, Button, message, Select } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, SaveOutlined, TagsOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { userApi } from '@/lib/userApi';
import { locationApi } from '@/lib/locationApi';
import { domainApi, Domain } from '@/lib/domainApi';
import CertificateUpload from '@/components/CertificateUpload';

const { TextArea } = Input;
const { Option } = Select;

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
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
          <Input size="large" prefix={<UserOutlined />} disabled={!isEditing} />
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
          <Input size="large" prefix={<MailOutlined />} disabled />
        </Form.Item>

        <Form.Item label="Vị trí công việc hiện tại" name="currentPosition">
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="VD: Senior Frontend Developer, Product Manager"
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input size="large" prefix={<PhoneOutlined />} placeholder="VD: 0123456789" disabled={!isEditing} />
        </Form.Item>

        <Form.Item 
          label="Lĩnh vực quan tâm" 
          name="domainId"
          rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực quan tâm!' }]}
        >
          <Select
            size="large"
            placeholder="Chọn lĩnh vực bạn quan tâm"
            disabled={!isEditing}
            loading={loadingDomains}
            suffixIcon={<TagsOutlined />}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {domains.map(domain => (
              <Option key={domain.id} value={domain.id}>
                {domain.name}
                {domain.description && (
                  <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                    - {domain.description}
                  </span>
                )}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Form.Item label="Quê quán (vị trí cố định)" name="hometown">
          <Input
            size="large"
            prefix={<EnvironmentOutlined />}
            placeholder="VD: Hà Nội, TP. Hồ Chí Minh"
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              Vị trí hiện tại (để ứng tuyển Freelance){' '}
              {isEditing && (
                <Button
                  type="link"
                  size="small"
                  icon={<EnvironmentOutlined />}
                  onClick={handleGetCurrentLocation}
                  loading={gettingLocation}
                  style={{ padding: 0, height: 'auto' }}
                >
                  Lấy GPS
                </Button>
              )}
            </span>
          }
          name="currentLocation"
          extra={isEditing ? "Nhấn 'Lấy GPS' để tự động lấy vị trí hiện tại" : undefined}
        >
          <Input
            size="large"
            prefix={<EnvironmentOutlined />}
            placeholder="Hoặc nhập thủ công"
            disabled={!isEditing}
          />
        </Form.Item>
      </div>

      <Form.Item label="Giới thiệu bản thân" name="bio">
        <TextArea rows={4} placeholder="Viết vài dòng về bản thân..." disabled={!isEditing} />
      </Form.Item>

      {isEditing && (
        <Form.Item
          label={
            <span>
              Ảnh chứng chỉ / Bằng cấp <span style={{ color: '#ff4d4f' }}>* Bắt buộc để ứng tuyển Freelance</span>
            </span>
          }
        >
          <CertificateUpload
            userId={user?.id || 0}
            currentImages={certificateImages}
            onImagesChange={setCertificateImages}
          />
        </Form.Item>
      )}

      {isEditing && (
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={loading}>
            Lưu thay đổi
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};
