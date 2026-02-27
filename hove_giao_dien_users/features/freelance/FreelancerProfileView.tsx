import { useState, useEffect } from 'react';
import { Card, Descriptions, List, Tag, Spin, Empty, Button, message, Image } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  ToolOutlined, 
  BookOutlined, 
  FileTextOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { api } from '@/lib/api';
import { cvApi } from '@/lib/cvApi';

interface FreelancerProfileViewProps {
  userId: number;
  cvUrl?: string;
}

export const FreelancerProfileView = ({ userId, cvUrl }: FreelancerProfileViewProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  console.log('FreelancerProfileView - userId:', userId, 'cvUrl:', cvUrl);

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

  const handleViewCV = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUser.id) {
        message.error('Vui lòng đăng nhập');
        return; 
      }
      
      const response = await api.get(`/api/user-cvs/user/${userId}`);
      const cvs = response.data;
      const cv = cvs.find((c: any) => c.fileUrl === cvUrl || 
                                      `http://localhost:8080${c.fileUrl}` === cvUrl);
      
      if (!cv) {
        message.error('Không tìm thấy CV');
        return;
      }
      
      if (cv.visibility === 'private' && currentUser.id !== userId) {
        message.warning('CV này ở chế độ riêng tư. Chỉ chủ nhân mới có thể xem.');
        return;
      }
      
      const { token } = await cvApi.generateViewToken(cv.id, currentUser.id);
      const viewUrl = `http://localhost:8080/api/cv/view/${token}`;
      window.open(viewUrl, '_blank');
    } catch (error: any) {
      console.error('View CV error:', error);
      message.error(error.response?.data?.error || 'Không thể xem CV');
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

  // Parse certificate images
  const certificateImages = profile.userInfo?.certificateImages 
    ? profile.userInfo.certificateImages.split(',').filter((url: string) => url.trim())
    : [];

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
          {profile.userInfo?.currentPosition && (
            <Descriptions.Item label="Vị trí hiện tại" span={2}>
              <IdcardOutlined /> {profile.userInfo.currentPosition}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Giới thiệu" span={2}>
            {profile.personalInfo?.bio || 'Chưa có giới thiệu'}
          </Descriptions.Item>
        </Descriptions>
        
        {/* Location Map */}
        {profile.userInfo?.currentLatitude && profile.userInfo?.currentLongitude && (
          <div style={{ marginTop: 24 }}>
            <div style={{ 
              marginBottom: 12,
              padding: 12,
              background: '#f0f5ff',
              borderRadius: 8,
              border: '1px solid #adc6ff'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#1890ff' }}>
                📍 Vị trí hiện tại trên bản đồ
              </div>
              <div style={{ fontSize: 13, color: '#595959' }}>
                <div><strong>Địa chỉ:</strong> {profile.userInfo.currentLocation || 'Chưa cập nhật'}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                  <strong>Tọa độ:</strong> {profile.userInfo.currentLatitude.toFixed(6)}, {profile.userInfo.currentLongitude.toFixed(6)}
                </div>
                {profile.userInfo.locationUpdatedAt && (
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                    <strong>Cập nhật:</strong> {new Date(profile.userInfo.locationUpdatedAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ 
              width: '100%', 
              height: 300, 
              borderRadius: 8,
              overflow: 'hidden',
              border: '2px solid #e8e8e8'
            }}>
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${profile.userInfo.currentLatitude},${profile.userInfo.currentLongitude}&zoom=15`}
              />
            </div>
            
            <div style={{ 
              marginTop: 12, 
              display: 'flex',
              gap: 16,
              fontSize: 13
            }}>
              <a 
                href={`https://www.google.com/maps?q=${profile.userInfo.currentLatitude},${profile.userInfo.currentLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1890ff' }}
              >
                🗺️ Mở trong Google Maps
              </a>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${profile.userInfo.currentLatitude},${profile.userInfo.currentLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1890ff' }}
              >
                🧭 Chỉ đường
              </a>
            </div>
          </div>
        )}
      </Card>

      {/* CV */}
      {cvUrl ? (
        <Card title={<><FileTextOutlined /> CV</>}>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handleViewCV}
            block
          >
            Xem CV
          </Button>
        </Card>
      ) : (
        <Card title={<><FileTextOutlined /> CV</>}>
          <div style={{
            padding: '20px',
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: '8px',
            border: '1px dashed #d9d9d9'
          }}>
            <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 12 }} />
            <div style={{ color: '#8c8c8c', fontSize: 14 }}>
              Ứng viên chưa tải CV lên
            </div>
          </div>
        </Card>
      )}

      {/* Certificates */}
      {certificateImages.length > 0 && (
        <Card title={<><SafetyCertificateOutlined /> Chứng chỉ</>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            <Image.PreviewGroup>
              {certificateImages.map((url: string, index: number) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Chứng chỉ ${index + 1}`}
                  style={{ 
                    width: '100%', 
                    height: 200, 
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0'
                  }}
                  placeholder={
                    <div style={{ 
                      width: '100%', 
                      height: 200, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f5f5f5'
                    }}>
                      <Spin />
                    </div>
                  }
                />
              ))}
            </Image.PreviewGroup>
          </div>
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
