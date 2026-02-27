import { Card, Avatar, Button, Tabs, Upload, message, Form, Input, Select, Modal, List, Tag, Progress, Row, Col, Empty, Spin, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, UploadOutlined, SaveOutlined, FileTextOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, LogoutOutlined, CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jobSeekerProfileApi, hrProfileApi, skillsApi, experienceApi, educationApi } from '@/lib/profileApi';
import { jobApi } from '@/lib/jobApi';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { companyApi } from '@/lib/companyApi';
import { uploadApi } from '@/lib/uploadApi';
import { api } from '@/lib/api';
import { locationApi } from '@/lib/locationApi';
import { CVManagement } from './CVManagement';
import { ExperienceManagement } from './ExperienceManagement';
import { EducationManagement } from './EducationManagement';
import { FreelanceManagement } from './FreelanceManagement';
import AvatarUpload from '@/components/AvatarUpload';
import CertificateUpload from '@/components/CertificateUpload';
import { LAYOUT } from '@/lib/constants';


const { TabPane } = Tabs;
const { TextArea } = Input;

export const ProfileFeature = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const nextRouter = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [certificateImages, setCertificateImages] = useState('');

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication on client side only after mount
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      nextRouter.push('/login');
    }
  }, [mounted, isAuthenticated, nextRouter]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || !isAuthenticated) {
    return null;
  }

  const handleSave = async (values: any) => {
    if (!user?.id) return;
    
    try {
      if (user?.userType === 'hr') {
        // Update HR profile
        const profileData = {
          userId: user.id,
          companyName: values.companyName,
          companySize: values.companySize,
          industry: values.industry,
          website: values.website,
          address: values.address,
          description: values.description,
        };
        
        // Try to get existing profile first
        try {
          const existing = await hrProfileApi.getProfile(user.id);
          await hrProfileApi.updateProfile(existing.id, profileData);
        } catch {
          // If not found, create new
          await hrProfileApi.createProfile(profileData);
        }
      } else {
        // Update Job Seeker/Freelancer profile
        const profileData = {
          userId: user.id,
          phone: values.phone,
          location: values.location,
          bio: values.bio,
        };
        
        try {
          const existing = await jobSeekerProfileApi.getProfile(user.id);
          await jobSeekerProfileApi.updateProfile(existing.id, profileData);
        } catch {
          await jobSeekerProfileApi.createProfile(profileData);
        }

        // Also update user entity with currentPosition, hometown, currentLocation, certificateImages
        await api.put(`/api/users/${user.id}`, {
          name: values.name,
          currentPosition: values.currentPosition,
          hometown: values.hometown,
          currentLocation: values.currentLocation,
          phone: values.phone,
          bio: values.bio,
          certificateImages,
        });
      }
      
      message.success('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      message.error('Cập nhật thất bại!');
    }
  };

  const handleAvatarUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success('Cập nhật ảnh đại diện thành công!');
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
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      console.log('Got coordinates:', latitude, longitude);
      
      // Format location string with coordinates
      const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      // Set value to form field "currentLocation"
      form.setFieldsValue({ currentLocation: locationString });
      
      // Try to save to database (optional - will fail silently if backend not running)
      if (user?.id) {
        try {
          await locationApi.updateLocation(user.id, {
            latitude,
            longitude,
            address: locationString
          });
          message.success({ 
            content: `Đã lưu vị trí: ${locationString}`, 
            key: 'location',
            duration: 3
          });
        } catch (saveError) {
          console.error('Save location error:', saveError);
          // Still show success even if save fails
          message.success({ 
            content: `Đã lấy vị trí: ${locationString}`, 
            key: 'location',
            duration: 3
          });
        }
      } else {
        message.success({ 
          content: `Đã lấy vị trí: ${locationString}`, 
          key: 'location',
          duration: 3
        });
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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className={`${LAYOUT.container} py-4`}>
        {/* Header Card */}
        <Card className="mb-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative">
              <AvatarUpload
                userId={user?.id || 0}
                currentAvatar={user?.avatarUrl}
                onAvatarChange={(url) => {
                  // Avatar will be updated via auth store
                }}
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 100}
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h1>
              <p className="text-sm text-gray-600 mb-2 flex items-center justify-center md:justify-start gap-2">
                <MailOutlined /> {user?.email}
              </p>
              <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  {user?.userType === 'job_seeker' 
                    ? 'Người tìm việc' 
                    : user?.userType === 'freelancer' 
                    ? 'Freelancer' 
                    : 'Nhà tuyển dụng'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 md:flex-none"
              >
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
              
              {user?.userType === 'hr' && (
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Xác nhận đăng xuất',
                      content: 'Bạn có chắc chắn muốn đăng xuất?',
                      okText: 'Đăng xuất',
                      cancelText: 'Hủy',
                      okButtonProps: { danger: true },
                      onOk: () => {
                        logout();
                        nextRouter.push('/login');
                      },
                    });
                  }}
                  className="flex-1 md:flex-none"
                >
                  Thoát
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Card>
          {user?.userType === 'hr' ? (
            // HR tabs
            <Tabs defaultActiveKey="1" className="profile-tabs">
              <TabPane tab="Thông tin công ty" key="1">
                <CompanyInfoSection isEditing={isEditing} form={form} handleSave={handleSave} />
              </TabPane>
              <TabPane tab="Quản lý tin tuyển dụng" key="2">
                <JobPostingManagementSection />
              </TabPane>
              <TabPane tab="📋 Quản lý Freelance" key="3">
                <FreelanceManagement />
              </TabPane>
              <TabPane tab="Quản lý Blog" key="4">
                <BlogManagementSection />
              </TabPane>
              <TabPane tab="Quản lý hình ảnh" key="5">
                <ImageGalleryManagementSection />
              </TabPane>
            </Tabs>
          ) : (
            // Job seeker and Freelancer tabs
            <Tabs defaultActiveKey="1" className="profile-tabs">
              <TabPane tab="Thông tin cá nhân" key="1">
                <PersonalInfoSection 
                  isEditing={isEditing} 
                  form={form} 
                  handleSave={handleSave} 
                  user={user}
                  gettingLocation={gettingLocation}
                  handleGetCurrentLocation={handleGetCurrentLocation}
                  certificateImages={certificateImages}
                  setCertificateImages={setCertificateImages}
                />
              </TabPane>
              <TabPane tab="Quản lý CV" key="2">
                <CVManagement />
              </TabPane>
              <TabPane tab="Kỹ năng" key="3">
                <SkillsSection isEditing={isEditing} />
              </TabPane>
              <TabPane tab="Kinh nghiệm" key="4">
                <ExperienceManagement />
              </TabPane>
              <TabPane tab="Học vấn" key="5">
                <EducationManagement />
              </TabPane>
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
};

const PersonalInfoSection = ({ 
  isEditing, 
  form, 
  handleSave, 
  user, 
  gettingLocation, 
  handleGetCurrentLocation,
  certificateImages,
  setCertificateImages 
}: any) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await jobSeekerProfileApi.getProfile(user.id);
      
      // Also load user data to get currentPosition, hometown, currentLocation, certificateImages
      const userData = await api.get(`/api/users/${user.id}`);
      
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        currentPosition: userData.data.currentPosition || '',
        hometown: userData.data.hometown || '',
        currentLocation: userData.data.currentLocation || '',
      });
      
      setCertificateImages(userData.data.certificateImages || '');
    } catch (error) {
      console.error('Load profile error:', error);
      // Profile doesn't exist yet, set defaults
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: '',
        location: '',
        bio: '',
        currentPosition: '',
        hometown: '',
        currentLocation: '',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: 'email' }]}
        >
          <Input
            size="large"
            prefix={<MailOutlined />}
            disabled
          />
        </Form.Item>

        <Form.Item
          label="Vị trí công việc hiện tại"
          name="currentPosition"
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="VD: Senior Frontend Developer, Product Manager"
            disabled={!isEditing}
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
            disabled={!isEditing}
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          label="Quê quán (vị trí cố định)"
          name="hometown"
        >
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

      <Form.Item
        label="Giới thiệu bản thân"
        name="bio"
      >
        <TextArea
          rows={4}
          placeholder="Viết vài dòng về bản thân..."
          disabled={!isEditing}
        />
      </Form.Item>

      {isEditing && (
        <Form.Item
          label={
            <span>
              Ảnh chứng chỉ / Bằng cấp{' '}
              <span style={{ color: '#ff4d4f' }}>* Bắt buộc để ứng tuyển Freelance</span>
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
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

const CompanyInfoSection = ({ isEditing, form, handleSave }: any) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadCompanyInfo();
    }
  }, [user?.id]);

  const loadCompanyInfo = async () => {
    setLoading(true);
    try {
      // Try to get company by HR ID (returns null if not found)
      const companyData = await companyApi.getCompanyByHrId(user!.id);
      
      if (companyData) {
        setCompany(companyData);
        setLogoUrl(companyData.logoUrl || '');
        
        form.setFieldsValue({
          logoUrl: companyData.logoUrl || '',
          name: companyData.name,
          companySize: companyData.companySize,
          industry: companyData.industry,
          website: companyData.website,
          email: companyData.email,
          phone: companyData.phone,
          address: companyData.address,
          description: companyData.description,
          mission: companyData.mission,
          vision: companyData.vision,
          values: companyData.values,
          benefits: companyData.benefits,
          workingHours: companyData.workingHours,
        });
      } else {
        // Company doesn't exist yet - this is normal for new HR users
        console.log('Company not found for HR, will create on save');
        setCompany(null);
        setLogoUrl('');
        form.resetFields();
      }
    } catch (error: any) {
      console.error('Load company error:', error);
      message.error('Không thể tải thông tin công ty');
      setCompany(null);
      setLogoUrl('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadApi.uploadImage(file);
      setLogoUrl(url);
      form.setFieldsValue({ logoUrl: url });
      message.success('Upload ảnh thành công!');
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('Upload ảnh thất bại!');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleCompanySave = async (values: any) => {
    try {
      const companyData = {
        hrId: user!.id,
        name: values.name,
        logoUrl: logoUrl || values.logoUrl,
        industry: values.industry,
        companySize: values.companySize,
        website: values.website,
        email: values.email,
        phone: values.phone,
        address: values.address,
        description: values.description,
        mission: values.mission,
        vision: values.vision,
        values: values.values,
        benefits: values.benefits,
        workingHours: values.workingHours,
      };

      if (company?.id) {
        await companyApi.updateCompany(company.id, companyData);
        message.success('Cập nhật thông tin công ty thành công!');
      } else {
        const created = await companyApi.createCompany(companyData);
        setCompany(created);
        message.success('Tạo thông tin công ty thành công!');
      }
      
      await loadCompanyInfo();
    } catch (error) {
      console.error('Save company error:', error);
      message.error('Lưu thông tin công ty thất bại!');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleCompanySave}
      initialValues={{
        logoUrl: '',
        name: '',
        companySize: '',
        industry: '',
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          label="Logo công ty"
          name="logoUrl"
          className="md:col-span-2"
        >
          <div className="flex gap-4 items-start">
            <Input
              size="large"
              placeholder="https://example.com/logo.png hoặc upload ảnh"
              disabled={!isEditing}
              value={logoUrl}
            />
            {isEditing && (
              <Upload
                beforeUpload={handleLogoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  size="large"
                >
                  Upload
                </Button>
              </Upload>
            )}
          </div>
          {logoUrl && (
            <div className="mt-2">
              <img src={logoUrl} alt="Logo preview" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }} />
            </div>
          )}
        </Form.Item>

        <Form.Item
          label="Tên công ty"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên công ty!' }]}
        >
          <Input
            size="large"
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item
          label="Quy mô công ty"
          name="companySize"
        >
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
          label="Lĩnh vực"
          name="industry"
        >
          <Input
            size="large"
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item
          label="Website"
          name="website"
        >
          <Input
            size="large"
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
        >
          <Input
            size="large"
            type="email"
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
        >
          <Input
            size="large"
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          className="md:col-span-2"
        >
          <Input
            size="large"
            prefix={<EnvironmentOutlined />}
            disabled={!isEditing}
          />
        </Form.Item>
      </div>

      <Form.Item
        label="Giới thiệu công ty"
        name="description"
      >
        <TextArea
          rows={4}
          placeholder="Viết vài dòng về công ty..."
          disabled={!isEditing}
        />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form.Item
          label="Sứ mệnh"
          name="mission"
        >
          <TextArea
            rows={3}
            placeholder="Sứ mệnh của công ty..."
            disabled={!isEditing}
          />
        </Form.Item>

        <Form.Item
          label="Tầm nhìn"
          name="vision"
        >
          <TextArea
            rows={3}
            placeholder="Tầm nhìn của công ty..."
            disabled={!isEditing}
          />
        </Form.Item>
      </div>

      <Form.Item
        label="Văn hóa công ty (mỗi dòng một giá trị)"
        name="values"
      >
        <TextArea
          rows={5}
          placeholder="Văn hóa cởi mở, khuyến khích sáng tạo&#10;Tôn trọng sự đa dạng&#10;Làm việc theo nhóm..."
          disabled={!isEditing}
        />
      </Form.Item>

      <Form.Item
        label="Phúc lợi (mỗi dòng một phúc lợi)"
        name="benefits"
      >
        <TextArea
          rows={5}
          placeholder="Lương thưởng cạnh tranh&#10;Bảo hiểm sức khỏe&#10;Làm việc từ xa linh hoạt..."
          disabled={!isEditing}
        />
      </Form.Item>

      <Form.Item
        label="Giờ làm việc"
        name="workingHours"
      >
        <Input
          size="large"
          placeholder="8:00 - 17:00, Thứ 2 - Thứ 6"
          disabled={!isEditing}
        />
      </Form.Item>

      {isEditing && (
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<SaveOutlined />}
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

const JobPostingManagementSection = () => {
  const { user } = useAuthStore();
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadJobs();
    }
  }, [user?.id]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await jobApi.getJobsByUser(user!.id);
      setJobPosts(data);
    } catch (error) {
      console.error('Load jobs error:', error);
      message.error('Không thể tải danh sách tin tuyển dụng!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa tin tuyển dụng',
      content: 'Bạn có chắc chắn muốn xóa tin này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await jobApi.deleteJob(id);
          await loadJobs();
          message.success('Đã xóa tin tuyển dụng!');
        } catch (error) {
          message.error('Xóa thất bại!');
        }
      },
    });
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await jobApi.toggleStatus(id);
      await loadJobs();
      message.success('Đã cập nhật trạng thái!');
    } catch (error) {
      message.error('Cập nhật thất bại!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-indigo-600">{jobPosts.length}</div>
          <div className="text-gray-600 mt-2">Tin đang đăng</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {jobPosts.reduce((sum, job) => sum + (job.applications || 0), 0)}
          </div>
          <div className="text-gray-600 mt-2">Ứng viên</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {jobPosts.reduce((sum, job) => sum + (job.views || 0), 0)}
          </div>
          <div className="text-gray-600 mt-2">Lượt xem</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">
            {jobPosts.filter(job => job.status === 'active').length}
          </div>
          <div className="text-gray-600 mt-2">Đang hoạt động</div>
        </Card>
      </div>

      {/* Create new job button */}
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        block
        className="h-14 text-lg"
        onClick={() => window.location.href = '/jobs/post'}
      >
        Đăng tin tuyển dụng mới
      </Button>

      {/* Job Posts List */}
      {loading ? (
        <Card className="text-center py-8">
          <div>Đang tải...</div>
        </Card>
      ) : jobPosts.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-gray-500">Chưa có tin tuyển dụng nào</div>
        </Card>
      ) : (
        <List
          dataSource={jobPosts}
          renderItem={(job) => (
            <Card className="mb-4 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                    <Tag color={job.status === 'active' ? 'green' : 'red'}>
                      {job.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>📍 {job.location} • 💰 {job.salaryMin} - {job.salaryMax} • 🕐 {job.jobType}</div>
                    <div>Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-green-600 font-medium">👥 {job.applications || 0} ứng viên</span>
                      <span className="text-blue-600">👁️ {job.views || 0} lượt xem</span>
                    </div>
                  </div>
                  <Progress 
                    percent={Math.min(((job.applications || 0) / 50) * 100, 100)} 
                    size="small" 
                    className="mt-2"
                    showInfo={false}
                    strokeColor="#10b981"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => window.location.href = `/jobs/${job.id}`}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    icon={<UserOutlined />}
                    onClick={() => window.location.href = `/applications/job/${job.id}`}
                  >
                    Xem ứng viên ({job.applications || 0})
                  </Button>
                  <Button
                    icon={<EditOutlined />}
                    type="primary"
                    onClick={() => window.location.href = `/jobs/post?id=${job.id}`}
                  >
                    Sửa
                  </Button>
                  <Button
                    onClick={() => handleToggleStatus(job.id)}
                  >
                    {job.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(job.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
};

const CVManagementSection = () => {
  const [cvList, setCvList] = useState([
    {
      id: 1,
      name: 'CV_Frontend_Developer.pdf',
      uploadDate: '2024-01-15',
      size: '2.5 MB',
      status: 'active',
      views: 45,
      downloads: 12,
    },
    {
      id: 2,
      name: 'CV_Fullstack_Developer.pdf',
      uploadDate: '2024-01-10',
      size: '2.8 MB',
      status: 'inactive',
      views: 23,
      downloads: 5,
    },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCV, setSelectedCV] = useState<any>(null);

  const handleUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} đã được tải lên thành công!`);
      // TODO: Add to CV list
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa CV',
      content: 'Bạn có chắc chắn muốn xóa CV này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        setCvList(cvList.filter(cv => cv.id !== id));
        message.success('Đã xóa CV thành công!');
      },
    });
  };

  const handleSetActive = (id: number) => {
    setCvList(cvList.map(cv => ({
      ...cv,
      status: cv.id === id ? 'active' : 'inactive',
    })));
    message.success('Đã đặt CV làm mặc định!');
  };

  const handlePreview = (cv: any) => {
    setSelectedCV(cv);
    setIsModalVisible(true);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300">
        <div className="text-center py-8">
          <FileTextOutlined className="text-6xl text-indigo-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Tải lên CV của bạn</h3>
          <p className="text-gray-600 mb-6">Hỗ trợ định dạng: PDF, DOC, DOCX (Tối đa 5MB)</p>
          <Upload
            accept=".pdf,.doc,.docx"
            showUploadList={false}
            onChange={handleUpload}
            maxCount={1}
          >
            <Button type="primary" size="large" icon={<UploadOutlined />}>
              Chọn file CV
            </Button>
          </Upload>
        </div>
      </Card>

      {/* CV Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-indigo-600">{cvList.length}</div>
          <div className="text-gray-600 mt-2">Tổng số CV</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {cvList.reduce((sum, cv) => sum + cv.views, 0)}
          </div>
          <div className="text-gray-600 mt-2">Lượt xem</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {cvList.reduce((sum, cv) => sum + cv.downloads, 0)}
          </div>
          <div className="text-gray-600 mt-2">Lượt tải xuống</div>
        </Card>
      </div>

      {/* CV List */}
      <List
        dataSource={cvList}
        renderItem={(cv) => (
          <Card className="mb-4 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileTextOutlined className="text-2xl text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{cv.name}</h4>
                    {cv.status === 'active' && (
                      <Tag color="green">Mặc định</Tag>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Ngày tải lên: {cv.uploadDate}</div>
                    <div>Kích thước: {cv.size}</div>
                    <div className="flex items-center gap-4">
                      <span>👁️ {cv.views} lượt xem</span>
                      <span>⬇️ {cv.downloads} lượt tải</span>
                    </div>
                  </div>
                  <Progress 
                    percent={Math.min((cv.views / 100) * 100, 100)} 
                    size="small" 
                    className="mt-2"
                    showInfo={false}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(cv)}
                >
                  Xem
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  type="primary"
                >
                  Tải xuống
                </Button>
                {cv.status !== 'active' && (
                  <Button
                    onClick={() => handleSetActive(cv.id)}
                  >
                    Đặt mặc định
                  </Button>
                )}
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(cv.id)}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </Card>
        )}
      />

      {/* CV Preview Modal */}
      <Modal
        title={selectedCV?.name}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            Tải xuống
          </Button>,
        ]}
      >
        <div className="bg-gray-100 p-8 rounded-lg min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <FileTextOutlined className="text-6xl text-gray-400 mb-4" />
            <p className="text-gray-600">Xem trước CV: {selectedCV?.name}</p>
            <p className="text-sm text-gray-500 mt-2">
              (Tính năng xem trước PDF sẽ được tích hợp)
            </p>
          </div>
        </div>
      </Modal>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Mẹo tạo CV hiệu quả:</h4>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>✓ Sử dụng định dạng PDF để đảm bảo hiển thị đúng trên mọi thiết bị</li>
          <li>✓ Giữ CV ngắn gọn, tập trung vào kinh nghiệm liên quan</li>
          <li>✓ Cập nhật CV thường xuyên với kỹ năng và dự án mới</li>
          <li>✓ Tùy chỉnh CV cho từng vị trí ứng tuyển</li>
          <li>✓ Kiểm tra chính tả và ngữ pháp trước khi tải lên</li>
        </ul>
      </Card>
    </div>
  );
};

const SkillsSection = ({ isEditing }: { isEditing: boolean }) => {
  const { user } = useAuthStore();
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSkills();
    }
  }, [user?.id]);

  const loadSkills = async () => {
    try {
      const data = await skillsApi.getSkills(user!.id);
      setSkills(data);
    } catch (error) {
      console.error('Load skills error:', error);
    }
  };

  const addSkill = async () => {
    if (!newSkill || skills.some(s => s.skillName === newSkill)) {
      return;
    }
    
    setLoading(true);
    try {
      await skillsApi.createSkill({
        userId: user!.id,
        skillName: newSkill,
        level: 'intermediate',
      });
      setNewSkill('');
      await loadSkills();
      message.success('Đã thêm kỹ năng!');
    } catch (error) {
      message.error('Thêm kỹ năng thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = async (id: number) => {
    try {
      await skillsApi.deleteSkill(id);
      await loadSkills();
      message.success('Đã xóa kỹ năng!');
    } catch (error) {
      message.error('Xóa kỹ năng thất bại!');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium flex items-center gap-2"
          >
            {skill.skillName}
            {isEditing && (
              <button
                onClick={() => removeSkill(skill.id)}
                className="text-indigo-500 hover:text-indigo-700"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      {isEditing && (
        <div className="flex gap-2">
          <Input
            placeholder="Thêm kỹ năng mới..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onPressEnter={addSkill}
            size="large"
          />
          <Button 
            type="primary" 
            onClick={addSkill} 
            size="large"
            loading={loading}
          >
            Thêm
          </Button>
        </div>
      )}
    </div>
  );
};

const BlogManagementSection = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<CompanyBlog | null>(null);
  const [hrProfile, setHrProfile] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      loadCompanyAndBlogs();
    }
  }, [user?.id]);

  const loadCompanyAndBlogs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load company info first (returns null if not found)
      const companyData = await companyApi.getCompanyByHrId(user.id);
      setCompany(companyData);
      
      // Only load blogs if company exists
      if (companyData) {
        const blogsData = await companyBlogApi.getBlogsByHR(user.id);
        setBlogs(blogsData);
      } else {
        setBlogs([]);
      }
    } catch (error: any) {
      console.error('Load error:', error);
      message.error('Không thể tải thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadHRProfile = async () => {
    try {
      const profile = await hrProfileApi.getProfile(user!.id);
      setHrProfile(profile);
    } catch (error) {
      console.error('Load HR profile error:', error);
    }
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await companyBlogApi.getBlogsByHR(user!.id);
      setBlogs(data);
    } catch (error) {
      message.error('Không thể tải danh sách blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!company) {
      message.warning('Vui lòng tạo thông tin công ty trước khi tạo blog!');
      return;
    }
    setEditingBlog(null);
    form.resetFields();
    form.setFieldsValue({
      companyId: company.id,
      status: 'draft',
    });
    setModalVisible(true);
  };

  const handleEdit = (blog: CompanyBlog) => {
    setEditingBlog(blog);
    form.setFieldsValue(blog);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await companyBlogApi.deleteBlog(id);
      message.success('Xóa blog thành công');
      loadBlogs();
    } catch (error) {
      message.error('Không thể xóa blog');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const blogData = {
        ...values,
        authorName: user?.name || user?.email || 'HR',
      };

      if (editingBlog) {
        await companyBlogApi.updateBlog(editingBlog.id!, blogData);
        message.success('Cập nhật blog thành công');
      } else {
        await companyBlogApi.createBlog(blogData);
        message.success('Tạo blog thành công');
      }
      setModalVisible(false);
      form.resetFields();
      loadBlogs();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    draft: blogs.filter(b => b.status === 'draft').length,
    totalViews: blogs.reduce((sum, b) => sum + (b.views || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.total}</div>
            <div className="text-gray-600 mt-2">Tổng số blog</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.published}</div>
            <div className="text-gray-600 mt-2">Đã xuất bản</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.draft}</div>
            <div className="text-gray-600 mt-2">Bản nháp</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.totalViews}</div>
            <div className="text-gray-600 mt-2">Tổng lượt xem</div>
          </Card>
        </Col>
      </Row>

      {/* Create Button */}
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        block
        className="h-14 text-lg"
        onClick={handleCreate}
      >
        Tạo Blog Mới
      </Button>

      {/* Blog List */}
      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
        </div>
      ) : blogs.length === 0 ? (
        <Card>
          <Empty description="Chưa có blog nào. Hãy tạo blog đầu tiên!">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Tạo Blog Ngay
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {blogs.map((blog) => (
            <Col xs={24} sm={12} lg={8} key={blog.id}>
              <Card
                hoverable
                cover={
                  blog.imageUrl ? (
                    <img
                      alt={blog.title}
                      src={blog.imageUrl}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '200px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '48px',
                      }}
                    >
                      📝
                    </div>
                  )
                }
                actions={[
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(blog)}
                    key="edit"
                  >
                    Sửa
                  </Button>,
                  <Popconfirm
                    title="Bạn có chắc muốn xóa blog này?"
                    onConfirm={() => handleDelete(blog.id!)}
                    okText="Xóa"
                    cancelText="Hủy"
                    key="delete"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {blog.title}
                    </div>
                  }
                  description={
                    <div>
                      <p style={{
                        color: '#6b7280',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '40px'
                      }}>
                        {blog.content}
                      </p>
                      <div style={{ marginBottom: '8px' }}>
                        <Tag color={blog.status === 'published' ? 'green' : 'orange'}>
                          {blog.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                        </Tag>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>
                        <span>
                          <EyeOutlined /> {blog.views || 0} lượt xem
                        </span>
                        <span>
                          <CalendarOutlined /> {new Date(blog.createdAt!).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {editingBlog ? '✏️ Chỉnh sửa Blog' : '✨ Tạo Blog Mới'}
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Công ty"
          >
            <Input 
              value={company?.name || 'Chưa cập nhật thông tin công ty'}
              disabled
              size="large"
              style={{ 
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontWeight: 500
              }}
            />
          </Form.Item>

          <Form.Item
            name="companyId"
            hidden
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề blog" size="large" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea
              rows={10}
              placeholder="Nhập nội dung blog..."
              style={{ fontSize: '15px' }}
            />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="URL Hình ảnh"
          >
            <Input placeholder="https://example.com/image.jpg" size="large" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select size="large">
              <Select.Option value="draft">
                <ClockCircleOutlined /> Nháp
              </Select.Option>
              <Select.Option value="published">
                <CheckCircleOutlined /> Xuất bản
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button size="large" onClick={() => {
              setModalVisible(false);
              form.resetFields();
            }} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
            >
              {editingBlog ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const ExperienceSection = ({ isEditing }: { isEditing: boolean }) => {
  const { user } = useAuthStore();
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadExperiences();
    }
  }, [user?.id]);

  const loadExperiences = async () => {
    try {
      const data = await experienceApi.getExperiences(user!.id);
      setExperiences(data);
    } catch (error) {
      console.error('Load experiences error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await experienceApi.deleteExperience(id);
      await loadExperiences();
      message.success('Đã xóa kinh nghiệm!');
    } catch (error) {
      message.error('Xóa thất bại!');
    }
  };

  return (
    <div className="space-y-4">
      {experiences.map((exp) => (
        <Card key={exp.id} className="border-l-4 border-indigo-500">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
              <p className="text-indigo-600 font-medium">{exp.company}</p>
              <p className="text-gray-500 text-sm mb-2">
                {exp.startDate} - {exp.isCurrent ? 'Hiện tại' : exp.endDate}
              </p>
              <p className="text-gray-700">{exp.description}</p>
            </div>
            {isEditing && (
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(exp.id)}
              >
                Xóa
              </Button>
            )}
          </div>
        </Card>
      ))}

      {isEditing && (
        <Button type="dashed" block size="large">
          + Thêm kinh nghiệm
        </Button>
      )}
    </div>
  );
};

const EducationSection = ({ isEditing }: { isEditing: boolean }) => {
  const { user } = useAuthStore();
  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadEducation();
    }
  }, [user?.id]);

  const loadEducation = async () => {
    try {
      const data = await educationApi.getEducations(user!.id);
      setEducation(data);
    } catch (error) {
      console.error('Load education error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await educationApi.deleteEducation(id);
      await loadEducation();
      message.success('Đã xóa học vấn!');
    } catch (error) {
      message.error('Xóa thất bại!');
    }
  };

  return (
    <div className="space-y-4">
      {education.map((edu) => (
        <Card key={edu.id} className="border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
              <p className="text-green-600 font-medium">{edu.school}</p>
              <p className="text-gray-500 text-sm mb-2">
                {edu.startDate} - {edu.endDate}
              </p>
              {edu.gpa && <p className="text-gray-700">GPA: {edu.gpa}</p>}
            </div>
            {isEditing && (
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(edu.id)}
              >
                Xóa
              </Button>
            )}
          </div>
        </Card>
      ))}

      {isEditing && (
        <Button type="dashed" block size="large">
          + Thêm học vấn
        </Button>
      )}
    </div>
  );
};

const ImageGalleryManagementSection = () => {
  const { user } = useAuthStore();
  const [company, setCompany] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCompanyAndImages();
    }
  }, [user?.id]);

  const loadCompanyAndImages = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const companyData = await companyApi.getCompanyByHrId(user.id);
      setCompany(companyData);
      
      // Load images from new API
      const { companyImageApi } = await import('@/lib/companyImageApi');
      const imagesData = await companyImageApi.getImagesByCompany(companyData.id);
      setImages(imagesData);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        message.warning('Vui lòng tạo thông tin công ty trước khi thêm hình ảnh');
      } else {
        message.error('Không thể tải thông tin công ty');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryUpload = async (file: File) => {
    if (!company) {
      message.warning('Vui lòng tạo thông tin công ty trước');
      return false;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh!');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không được vượt quá 5MB!');
      return false;
    }

    setUploading(true);
    try {
      // Upload image to get URL
      const url = await uploadApi.uploadImage(file);
      
      // Validate URL
      if (!url || !url.startsWith('http')) {
        throw new Error('Invalid image URL');
      }
      
      console.log('Uploaded image URL:', url); // Debug log
      
      // Save to database
      const { companyImageApi } = await import('@/lib/companyImageApi');
      const savedImage = await companyImageApi.createImage({
        companyId: company.id,
        imageUrl: url,
        displayOrder: images.length,
      });
      
      console.log('Saved image:', savedImage); // Debug log
      
      // Reload images
      await loadCompanyAndImages();
      message.success('Upload ảnh thành công!');
      return false;
    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(error.message || 'Upload ảnh thất bại!');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    try {
      const { companyImageApi } = await import('@/lib/companyImageApi');
      await companyImageApi.deleteImage(imageId);
      
      // Reload images
      await loadCompanyAndImages();
      message.success('Đã xóa ảnh!');
    } catch (error) {
      message.error('Xóa ảnh thất bại!');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  if (!company) {
    return (
      <Card>
        <Empty 
          description="Vui lòng tạo thông tin công ty trước khi thêm hình ảnh"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Card className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{images.length}</div>
            <div className="text-gray-600 mt-2">Tổng số ảnh</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {Math.max(0, 20 - images.length)}
            </div>
            <div className="text-gray-600 mt-2">Còn lại</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600">20</div>
            <div className="text-gray-600 mt-2">Giới hạn</div>
          </Card>
        </Col>
      </Row>

      {/* Upload Button */}
      <Card>
        <div className="text-center py-8">
          <Upload
            beforeUpload={handleGalleryUpload}
            showUploadList={false}
            accept="image/*"
            disabled={images.length >= 20}
          >
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={images.length >= 20}
            >
              {images.length >= 20 ? 'Đã đạt giới hạn' : 'Thêm ảnh mới'}
            </Button>
          </Upload>
          <p className="text-gray-500 mt-4">
            Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB mỗi ảnh)
          </p>
          {images.length > 0 && (
            <Button
              danger
              size="small"
              className="mt-2"
              onClick={async () => {
                Modal.confirm({
                  title: 'Xóa tất cả ảnh?',
                  content: 'Bạn có chắc chắn muốn xóa tất cả ảnh giới thiệu?',
                  okText: 'Xóa tất cả',
                  cancelText: 'Hủy',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    try {
                      const { companyImageApi } = await import('@/lib/companyImageApi');
                      await companyImageApi.deleteImagesByCompany(company.id);
                      await loadCompanyAndImages();
                      message.success('Đã xóa tất cả ảnh!');
                    } catch (error) {
                      message.error('Xóa thất bại!');
                    }
                  },
                });
              }}
            >
              Xóa tất cả ảnh
            </Button>
          )}
        </div>
      </Card>

      {/* Image Gallery */}
      <Card title={`Hình ảnh giới thiệu (${images.length})`}>
        {images.length > 0 ? (
          <Row gutter={[16, 16]}>
            {images.map((image: any, index: number) => (
              <Col key={image.id} xs={12} sm={8} md={6} lg={4}>
                <div className="relative group">
                  <img
                    src={image.imageUrl}
                    alt={image.description || `Gallery ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(image.imageUrl, '_blank')}
                    onError={(e) => {
                      console.error('Image load error:', image.imageUrl);
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Error+Loading+Image';
                      e.currentTarget.style.backgroundColor = '#fee';
                    }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Popconfirm
                      title="Xác nhận xóa ảnh?"
                      onConfirm={() => handleRemoveImage(image.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        type="primary"
                      />
                    </Popconfirm>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    #{index + 1}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty 
            description="Chưa có ảnh giới thiệu. Hãy thêm ảnh để giới thiệu công ty của bạn!"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Mẹo tạo gallery ảnh hiệu quả:</h4>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>✓ Sử dụng ảnh chất lượng cao, rõ nét</li>
          <li>✓ Thể hiện văn phòng, môi trường làm việc</li>
          <li>✓ Hình ảnh team building, sự kiện công ty</li>
          <li>✓ Sản phẩm, dự án tiêu biểu</li>
          <li>✓ Tránh sử dụng ảnh có watermark</li>
        </ul>
      </Card>
    </div>
  );
};
