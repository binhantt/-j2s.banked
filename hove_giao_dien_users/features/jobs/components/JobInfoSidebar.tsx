import { Card, Button, Space, Statistic, Row, Col } from 'antd';
import { MessageOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';
import { companyApi, CompanyWithDomain } from '@/lib/companyApi';

interface JobInfoSidebarProps {
  job: any;
  onChatWithHR: () => void;
  companyName?: string;
}

export const JobInfoSidebar = ({ job, onChatWithHR, companyName }: JobInfoSidebarProps) => {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const levelMap: any = {
    'intern': 'Intern',
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior',
    'lead': 'Lead',
    'manager': 'Manager',
  };

  // Format experienceYearsMin (INT) to display text
  const formatExperience = (experienceYearsMin: number | undefined | null, experience: string | undefined): string => {
    if (experienceYearsMin !== undefined && experienceYearsMin !== null) {
      if (experienceYearsMin === 0) return 'Không yêu cầu';
      if (experienceYearsMin === 1) return '1 năm';
      if (experienceYearsMin === 2) return '2 năm';
      if (experienceYearsMin === 3) return '3 năm';
      if (experienceYearsMin === 5) return '5 năm';
      if (experienceYearsMin === 7) return '7+ năm';
      return `${experienceYearsMin} năm`;
    }
    // Fallback to legacy String field
    if (experience) return experience;
    return 'Không yêu cầu';
  };

  const isOwner = user?.id === job.userId;
  const [companyProfile, setCompanyProfile] = useState<CompanyWithDomain | null>(null);

  useEffect(() => {
    const loadCompanyProfile = async () => {
      if (!job?.userId) return;
      try {
        const data = await companyApi.getCompanyWithDomainByHrId(job.userId);
        setCompanyProfile(data);
      } catch (error) {
        setCompanyProfile(null);
      }
    };

    loadCompanyProfile();
  }, [job?.userId]);

  const displayCompanyName = companyName || job.companyName || companyProfile?.name || 'Công ty tuyển dụng';
  const companyInitial = displayCompanyName?.charAt(0)?.toUpperCase() || 'C';
  const companyIndustry =
    companyProfile?.domain?.name ||
    job.industryName ||
    job.industry ||
    job.companyIndustry ||
    job.field ||
    'Chưa cập nhật lĩnh vực';
  const companyAddress =
    companyProfile?.address ||
    job.companyAddress ||
    job.address ||
    job.companyLocation ||
    job.location ||
    'Chưa cập nhật địa chỉ';

  return (
    <>
      {isOwner ? (
        // Sidebar dành cho HR (chủ sở hữu công việc)
        <>
          <Card 
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Thống kê tuyển dụng</span>}
            style={{ borderRadius: 8, marginBottom: 24 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Ứng viên"
                  value={job.applications || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Lượt xem"
                  value={job.views || 0}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: 20 }}
                />
              </Col>
            </Row>
            
            <div style={{ marginTop: 20, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#389e0d' }}>
                Quản lý tuyển dụng
              </div>
              <Button 
                type="primary" 
                block 
                size="large"
                icon={<UserOutlined />}
                onClick={() => router.push(`/applications/job/${job.id}`)}
                style={{ marginBottom: 8 }}
              >
                Xem tất cả ứng viên ({job.applications || 0})
              </Button>
              <Button 
                block 
                size="large"
                onClick={() => router.push(`/jobs/edit/${job.id}`)}
              >
                Chỉnh sửa tin tuyển dụng
              </Button>
            </div>
          </Card>

          <Card 
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Thông tin tin tuyển dụng</span>}
            style={{ borderRadius: 8, marginBottom: 24 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Trạng thái</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {job.status === 'active' ? '🟢 Đang tuyển' : '🔴 Đã đóng'}
                </div>
              </div>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Ngày đăng</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Hạn nộp hồ sơ</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '31/03/2026'}
                </div>
              </div>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Cấp bậc</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{levelMap[job.level] || 'Intern'}</div>
              </div>
            </Space>
          </Card>
        </>
      ) : (
        // Sidebar dành cho người tìm việc
        <>
          <Card 
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Thông tin chung</span>}
            style={{ borderRadius: 8, marginBottom: 24 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Cấp bậc</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{levelMap[job.level] || 'Intern'}</div>
              </div>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Kinh nghiệm</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {formatExperience(job.experienceYearsMin, job.experience)}
                </div>
              </div>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Hạn nộp hồ sơ</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '31/03/2026'}
                </div>
              </div>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Lượt xem</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{job.views || 25} lượt</div>
              </div>
              <div>
                <div style={{ color: '#8c8c8c', fontSize: 13, marginBottom: 4 }}>Số lượng ứng tuyển</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{job.applications || 1} ứng viên</div>
              </div>
            </Space>
          </Card>

          <Card 
            style={{ borderRadius: 8, marginBottom: 24 }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div style={{ 
              background: '#e6f7ff', 
              padding: '16px', 
              borderRadius: 8,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>
                Liên hệ nhanh
              </div>
              <div style={{ fontSize: 13, color: '#595959', marginBottom: 12 }}>
                Bạn có thắc mắc về vị trí này? Trò chuyện trực tiếp với HR để được giải đáp.
              </div>
            </div>
            <Button 
              type="primary" 
              block 
              size="large"
              icon={<MessageOutlined />}
              onClick={onChatWithHR}
            >
              Chat với HR
            </Button>
            <p style={{ marginTop: 12, color: '#8c8c8c', fontSize: 12, textAlign: 'center' }}>
              Nhận phản hồi nhanh chóng từ nhà tuyển dụng
            </p>
          </Card>
        </>
      )}

      <Card 
        style={{ borderRadius: 8 }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 600,
            color: '#1890ff'
          }}>
            {companyInitial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{displayCompanyName}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{companyIndustry}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
          📍 {companyAddress}
        </div>
        <Button type="link" style={{ padding: 0, height: 'auto', fontSize: 13 }}>
          Xem trang công ty
        </Button>
      </Card>
    </>
  );
};
