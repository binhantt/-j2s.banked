import { Form, Input, Select, Button, Upload, message } from 'antd';
import { EnvironmentOutlined, UploadOutlined, SaveOutlined, TagsOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { uploadApi } from '@/lib/uploadApi';
import { useProfileStore } from '../store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { domainApi, Domain } from '@/lib/domainApi';

const { TextArea } = Input;

interface CompanyInfoFormProps {
  isEditing: boolean;
  onSaveSuccess?: () => void;
}

export const CompanyInfoForm = ({ isEditing, onSaveSuccess }: CompanyInfoFormProps) => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const { companyProfile, loading, loadCompanyProfile, saveCompanyProfile } = useProfileStore();
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCompanyProfile(user.id);
    }
    loadDomains();
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

  useEffect(() => {
    if (companyProfile) {
      setLogoUrl(companyProfile.logoUrl || '');
      
      form.setFieldsValue({
        logoUrl: companyProfile.logoUrl || '',
        name: companyProfile.name,
        companySize: companyProfile.companySize,
        domainId: companyProfile.domainId,
        website: companyProfile.website,
        email: companyProfile.email,
        phone: companyProfile.phone,
        address: companyProfile.address,
        description: companyProfile.description,
        mission: companyProfile.mission,
        vision: companyProfile.vision,
        values: companyProfile.values,
        benefits: companyProfile.benefits,
        workingHours: companyProfile.workingHours,
      });
    }
  }, [companyProfile, form]);

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setLogoUrl(url);
      form.setFieldsValue({ logoUrl: url });
      message.success('Upload ảnh thành công!');
      return false;
    } catch (error) {
      message.error('Upload ảnh thất bại!');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!user?.id) {
      message.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      await saveCompanyProfile({
        hrId: user.id,
        ...values,
        logoUrl: logoUrl || values.logoUrl,
      });
      message.success('Lưu thông tin công ty thành công!');
      onSaveSuccess?.();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Có lỗi xảy ra';
      console.error('❌ Lỗi khi lưu công ty:', errorMsg);
      message.error(`Lưu thông tin công ty thất bại: ${errorMsg}`);
    }
  };

  if (loading && !companyProfile) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      initialValues={{
        logoUrl: '',
        name: '',
        companySize: '',
        domainId: undefined,
        website: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        mission: '',
        vision: '',
        values: '',
        benefits: '',
        workingHours: '',
      }}
    >
      {/* Logo và Tên công ty */}
      <div className="mb-6">
        <Form.Item label="Logo công ty" name="logoUrl">
          <div className="flex gap-4 items-start">
            <Input
              size="large"
              placeholder="https://example.com/logo.png hoặc upload ảnh"
              disabled={!isEditing}
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value);
                form.setFieldsValue({ logoUrl: e.target.value });
              }}
            />
            {isEditing && (
              <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />} loading={uploading} size="large">
                  Upload
                </Button>
              </Upload>
            )}
          </div>
          {logoUrl && (
            <div className="mt-2">
              <img
                src={logoUrl}
                alt="Logo preview"
                style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
              />
            </div>
          )}
        </Form.Item>

        <Form.Item
          label="Tên công ty"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên công ty!' }]}
        >
          <Input size="large" disabled={!isEditing} />
        </Form.Item>
      </div>

      {/* Thông tin công ty - 3 cột */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Form.Item label="Quy mô công ty" name="companySize">
          <Select
            size="large"
            disabled={!isEditing}
            options={[
              { value: '1-50 nhân viên', label: '1-50 nhân viên' },
              { value: '51-200 nhân viên', label: '51-200 nhân viên' },
              { value: '201-500 nhân viên', label: '201-500 nhân viên' },
              { value: '501-1000 nhân viên', label: '501-1000 nhân viên' },
              { value: '1000+ nhân viên', label: 'Trên 1000 nhân viên' },
            ]}
          />
        </Form.Item>

        <Form.Item 
          label="Lĩnh vực hoạt động" 
          name="domainId"
          rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực hoạt động!' }]}
        >
          <Select
            size="large"
            placeholder="Chọn lĩnh vực hoạt động"
            disabled={!isEditing}
            loading={loadingDomains}
            suffixIcon={<TagsOutlined />}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {domains.map(domain => (
              <Select.Option key={domain.id} value={domain.id}>
                {domain.name}
                {domain.description && (
                  <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                    - {domain.description}
                  </span>
                )}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Website" name="website">
          <Input size="large" disabled={!isEditing} />
        </Form.Item>
      </div>

      {/* Thông tin liên hệ - 3 cột */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Form.Item label="Email" name="email">
          <Input size="large" type="email" disabled={!isEditing} />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input size="large" disabled={!isEditing} />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input size="large" prefix={<EnvironmentOutlined />} disabled={!isEditing} />
        </Form.Item>
      </div>

      <Form.Item label="Giới thiệu công ty" name="description">
        <TextArea rows={4} placeholder="Viết vài dòng về công ty..." disabled={!isEditing} />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item label="Sứ mệnh" name="mission">
          <TextArea rows={3} placeholder="Sứ mệnh của công ty..." disabled={!isEditing} />
        </Form.Item>

        <Form.Item label="Tầm nhìn" name="vision">
          <TextArea rows={3} placeholder="Tầm nhìn của công ty..." disabled={!isEditing} />
        </Form.Item>
      </div>

      <Form.Item label="Văn hóa công ty (mỗi dòng một giá trị)" name="values">
        <TextArea
          rows={5}
          placeholder="Văn hóa cởi mở, khuyến khích sáng tạo&#10;Tôn trọng sự đa dạng&#10;Làm việc theo nhóm..."
          disabled={!isEditing}
        />
      </Form.Item>

      <Form.Item label="Phúc lợi (mỗi dòng một phúc lợi)" name="benefits">
        <TextArea
          rows={5}
          placeholder="Lương thưởng cạnh tranh&#10;Bảo hiểm sức khỏe&#10;Làm việc từ xa linh hoạt..."
          disabled={!isEditing}
        />
      </Form.Item>

      <Form.Item label="Giờ làm việc" name="workingHours">
        <Input size="large" placeholder="8:00 - 17:00, Thứ 2 - Thứ 6" disabled={!isEditing} />
      </Form.Item>

      {isEditing && (
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={loading}>
            Lưu thay đổi
          </Button>
        </Form.Item>
      )}
    </Form>
    </div>
  );
};
