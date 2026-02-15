import { useState, useEffect } from 'react';
import { Card, Descriptions, List, Tag, Spin, Empty, Button, message } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, ToolOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import { cvApi } from '@/lib/cvApi';

interface CandidateProfileViewProps {
  userId: number;
  cvUrl?: string;
}

export const CandidateProfileView = ({ userId, cvUrl }: CandidateProfileViewProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  console.log('CandidateProfileView props:', { userId, cvUrl });

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/candidate-profile/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return <Empty description="Không có thông tin" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Personal Info */}
      <Card title={<><UserOutlined /> Thông tin cá nhân</>}>
        <Descriptions column={2}>
          {profile.userInfo?.name && (
            <Descriptions.Item label="Họ tên" span={2}>
              {profile.userInfo.name}
            </Descriptions.Item>
          )}
          {profile.userInfo?.email && (
            <Descriptions.Item label="Email" span={2}>
              {profile.userInfo.email}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Số điện thoại">
            <PhoneOutlined /> {profile.personalInfo?.phone || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            <EnvironmentOutlined /> {profile.personalInfo?.location || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Giới thiệu" span={2}>
            {profile.personalInfo?.bio || 'Chưa có giới thiệu'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* CV */}
      {cvUrl && (
        <Card title={<><FileTextOutlined /> CV</>}>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={async () => {
              try {
                // Get current user
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (!currentUser.id) {
                  message.error('Vui lòng đăng nhập');
                  return;
                }
                
                // Find CV ID from cvUrl
                const response = await api.get(`/api/user-cvs/user/${userId}`);
                const cvs = response.data;
                const cv = cvs.find((c: any) => c.fileUrl === cvUrl || 
                                              `http://localhost:8080${c.fileUrl}` === cvUrl);
                
                if (!cv) {
                  message.error('Không tìm thấy CV');
                  return;
                }
                
                // Check if CV is private and viewer is not owner
                if (cv.visibility === 'private' && currentUser.id !== userId) {
                  message.warning('CV này ở chế độ riêng tư. Chỉ chủ nhân mới có thể xem.');
                  return;
                }
                
                // Generate secure token
                const { token } = await cvApi.generateViewToken(cv.id, currentUser.id);
                
                // Open CV with token (secure, no userId exposed)
                // Call backend directly, not through Next.js
                const viewUrl = `http://localhost:8080/api/cv/view/${token}`;
                window.open(viewUrl, '_blank');
              } catch (error: any) {
                console.error('View CV error:', error);
                message.error(error.response?.data?.error || 'Không thể xem CV');
              }
            }}
            block
          >
            Xem CV
          </Button>
        </Card>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card title={<><ToolOutlined /> Kỹ năng</>}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.skills.map((skill: any) => (
              <Tag key={skill.id} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {skill.skillName || skill.name} {skill.level && `- ${skill.level}`}
              </Tag>
            ))}
          </div>
        </Card>
      )}

      {/* Experience */}
      {profile.experiences && profile.experiences.length > 0 && (
        <Card title={<><ToolOutlined /> Kinh nghiệm làm việc</>}>
          <List
            dataSource={profile.experiences}
            renderItem={(exp: any) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div>
                      <div style={{ fontWeight: 600 }}>{exp.title}</div>
                      <div style={{ color: '#666', fontSize: 14 }}>{exp.company}</div>
                    </div>
                  }
                  description={
                    <div>
                      <div>
                        📍 {exp.location} • 📅 {exp.startDate} - {exp.isCurrent ? 'Hiện tại' : exp.endDate}
                      </div>
                      {exp.description && (
                        <div style={{ marginTop: 8, color: '#666' }}>{exp.description}</div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Education */}
      {profile.educations && profile.educations.length > 0 && (
        <Card title={<><BookOutlined /> Học vấn</>}>
          <List
            dataSource={profile.educations}
            renderItem={(edu: any) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div>
                      <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                      <div style={{ color: '#666', fontSize: 14 }}>{edu.school}</div>
                    </div>
                  }
                  description={
                    <div>
                      <div>
                        📚 {edu.fieldOfStudy} • 📅 {edu.startDate} - {edu.endDate || 'Hiện tại'}
                        {edu.gpa && ` • GPA: ${edu.gpa}`}
                      </div>
                      {edu.description && (
                        <div style={{ marginTop: 8, color: '#666' }}>{edu.description}</div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};
