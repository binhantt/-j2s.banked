import { Card, Button, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

interface JobInfoSidebarProps {
  job: any;
  onChatWithHR: () => void;
  companyName?: string;
}

export const JobInfoSidebar = ({ job, onChatWithHR, companyName }: JobInfoSidebarProps) => {
  const levelMap: any = {
    'intern': 'Intern',
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior',
    'lead': 'Lead',
    'manager': 'Manager',
  };

  return (
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
            <div style={{ fontWeight: 500, fontSize: 14 }}>{job.experience || '2 years'}</div>
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

      <Card 
        style={{ borderRadius: 8 }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
            A
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{companyName || 'Acgen'}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Công nghệ thông tin</div>
          </div>
        </div>
        <Button type="link" style={{ padding: 0, height: 'auto', fontSize: 13 }}>
          Xem trang công ty
        </Button>
      </Card>
    </>
  );
};
