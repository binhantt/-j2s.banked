import { Button, Card, Row, Col, Avatar, Spin, message, Space, Modal, Form, Input } from 'antd';
import {
  EnvironmentOutlined,
  HeartOutlined,
  MessageOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { jobApi } from '@/lib/jobApi';
import { chatApi } from '@/lib/chatApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';
import { JobComments } from './components/JobComments';
import { CVUpload } from '@/components/CVUpload';
import { CandidateProfileView } from '@/features/applications/CandidateProfileView';
import form from 'antd/es/form';


interface JobDetailFeatureProps {
  jobId: string;
}

export const JobDetailFeature = ({ jobId }: JobDetailFeatureProps) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { canApplyJob } = usePermissions();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadJob();
    checkApplied();
  }, [jobId]);

  const checkApplied = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      const { applicationApi } = await import('@/lib/applicationApi');
      const applied = await applicationApi.checkApplied(Number(jobId), user.id);
      setHasApplied(applied);
    } catch (error) {
      console.error('Check applied error:', error);
    }
  };

  const loadJob = async () => {
    if (!jobId || jobId === 'undefined' || jobId === 'null') {
      console.error('Invalid jobId:', jobId);
      message.error('ID công việc không hợp lệ');
      setLoading(false);
      return;
    }

    const numericJobId = Number(jobId);
    if (isNaN(numericJobId)) {
      console.error('jobId is NaN:', jobId);
      message.error('ID công việc không hợp lệ');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await jobApi.getJob(numericJobId);
      console.log('Loaded job:', data); // Debug log
      setJob(data);
      await jobApi.incrementViews(numericJobId);
    } catch (error) {
      console.error('Load job error:', error);
      message.error('Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để chat với HR');
      router.push('/login');
      return;
    }

    try {
      const conversation = await chatApi.createConversation({
        jobPostingId: job.id,
        jobSeekerId: user?.id,
        hrId: job.userId,
      });
      router.push(`/chat/${conversation.id}`);
    } catch (error) {
      message.error('Không thể bắt đầu chat');
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để ứng tuyển');
      router.push('/login');
      return;
    }

    if (hasApplied) {
      message.info('Bạn đã ứng tuyển vào công việc này rồi');
      return;
    }

    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (values: any) => {
    // Show preview modal first
    setApplyModalOpen(false);
    setPreviewModalOpen(true);
  };
  
  const handleConfirmApply = async () => {
    const values = form.getFieldsValue();
    
    // Validate required fields
    if (!values.cvUrl) {
      message.error('Vui lòng chọn CV');
      setPreviewModalOpen(false);
      setApplyModalOpen(true);
      return;
    }
    
    if (!values.coverLetter) {
      message.error('Vui lòng viết thư xin việc');
      setPreviewModalOpen(false);
      setApplyModalOpen(true);
      return;
    }
    
    setApplyLoading(true);
    try {
      const { applicationApi } = await import('@/lib/applicationApi');
      
      console.log('=== Applying for job ===');
      console.log('Job ID:', jobId);
      console.log('User ID:', user?.id);
      console.log('CV URL:', values.cvUrl);
      
      await applicationApi.applyJob({
        jobPostingId: Number(jobId),
        userId: user?.id,
        cvUrl: values.cvUrl,
        coverLetter: values.coverLetter,
      });
      
      message.success('Ứng tuyển thành công!');
      setPreviewModalOpen(false);
      setApplyModalOpen(false);
      setHasApplied(true);
      form.resetFields();
    } catch (error: any) {
      console.error('Apply error:', error);
      console.error('Error response:', error.response);
      message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi ứng tuyển');
    } finally {
      setApplyLoading(false);
    }
  };

  const jobTypeMap: any = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Internship',
  };

  const levelMap: any = {
    'intern': 'Intern',
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior',
    'lead': 'Lead',
    'manager': 'Manager',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <h2>Không tìm thấy công việc</h2>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 20px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Job Info Card */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <Avatar 
                size={80} 
                shape="square"
                src={job.companyLogoUrl}
                style={{ 
                  background: job.companyLogoUrl ? 'transparent' : '#f0f0f0', 
                  color: '#999', 
                  fontSize: 32,
                  border: '1px solid #e8e8e8'
                }}
              >
                {!job.companyLogoUrl && (job.companyName?.charAt(0) || job.title.charAt(0))}
              </Avatar>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>
                  {job.title}
                </h1>
                <p style={{ fontSize: 18, color: '#666', marginBottom: 12, fontWeight: 500 }}>
                  {job.companyName || 'Công ty tuyển dụng'}
                </p>
                <Space direction="vertical" size={8}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                    <EnvironmentOutlined />
                    <span>{job.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                    <DollarOutlined />
                    <span>{job.salaryMin} - {job.salaryMax}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666' }}>
                    <ClockCircleOutlined />
                    <span>{jobTypeMap[job.jobType]} • {levelMap[job.level]}</span>
                  </div>
                  {job.maxApplicants && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: job.applications >= job.maxApplicants ? '#ff4d4f' : '#52c41a', fontWeight: 500 }}>
                      👥 <span>{job.applications || 0}/{job.maxApplicants} người</span>
                      {job.applications >= job.maxApplicants && <span style={{ color: '#ff4d4f' }}>(Đã đủ)</span>}
                    </div>
                  )}
                </Space>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {canApplyJob && (
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ flex: 1 }}
                  onClick={handleApplyClick}
                  disabled={hasApplied || job.status === 'closed' || (job.maxApplicants && job.applications >= job.maxApplicants)}
                >
                  {hasApplied ? 'Đã ứng tuyển' : job.status === 'closed' ? 'Đã đóng' : (job.maxApplicants && job.applications >= job.maxApplicants) ? 'Đã đủ người' : 'Ứng tuyển ngay'}
                </Button>
              )}
              {user?.id === job.userId && (
                <Button
                  danger={job.status === 'active'}
                  type={job.status === 'closed' ? 'default' : 'primary'}
                  size="large"
                  onClick={async () => {
                    try {
                      const newStatus = job.status === 'active' ? 'closed' : 'active';
                      await jobApi.updateJob(job.id, { ...job, status: newStatus });
                      message.success(newStatus === 'closed' ? 'Đã ngừng tuyển' : 'Đã mở lại tuyển dụng');
                      loadJob();
                    } catch (error) {
                      message.error('Có lỗi xảy ra');
                    }
                  }}
                >
                  {job.status === 'closed' ? 'Mở lại tuyển dụng' : 'Ngừng tuyển'}
                </Button>
              )}
              <Button
                size="large"
                icon={<MessageOutlined />}
                onClick={handleStartChat}
              >
                Chat với HR
              </Button>
              <Button size="large" icon={<HeartOutlined />} />
            </div>
          </Card>

          {/* Description */}
          <Card title="Mô tả công việc" style={{ marginBottom: 24, borderRadius: 12 }}>
            <div style={{ whiteSpace: 'pre-line', color: '#666' }}>{job.description}</div>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card title="Yêu cầu ứng viên" style={{ marginBottom: 24, borderRadius: 12 }}>
              <div style={{ whiteSpace: 'pre-line', color: '#666' }}>{job.requirements}</div>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card title="Quyền lợi" style={{ marginBottom: 24, borderRadius: 12 }}>
              <div style={{ whiteSpace: 'pre-line', color: '#666' }}>{job.benefits}</div>
            </Card>
          )}

          {/* Comments Section */}
          <JobComments jobId={Number(jobId)} />
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          <Card title="Thông tin chung" style={{ borderRadius: 12, marginBottom: 24 }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <div style={{ color: '#999', fontSize: 14, marginBottom: 4 }}>Cấp bậc</div>
                <div style={{ fontWeight: 500 }}>{levelMap[job.level]}</div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: 14, marginBottom: 4 }}>Kinh nghiệm</div>
                <div style={{ fontWeight: 500 }}>{job.experience || 'Không yêu cầu'}</div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: 14, marginBottom: 4 }}>Hạn nộp hồ sơ</div>
                <div style={{ fontWeight: 500 }}>
                  {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                </div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: 14, marginBottom: 4 }}>Lượt xem</div>
                <div style={{ fontWeight: 500 }}>{job.views || 0} lượt</div>
              </div>
              <div>
                <div style={{ color: '#999', fontSize: 14, marginBottom: 4 }}>Số lượng ứng tuyển</div>
                <div style={{ fontWeight: 500 }}>{job.applications || 0} ứng viên</div>
              </div>
            </Space>
          </Card>

          {/* Quick Chat */}
          <Card 
            title="Liên hệ nhanh" 
            style={{ borderRadius: 12 }}
          >
            <Button 
              type="primary" 
              block 
              size="large"
              icon={<MessageOutlined />}
              onClick={handleStartChat}
            >
              Chat với HR
            </Button>
            <p style={{ marginTop: 12, color: '#999', fontSize: 13, textAlign: 'center' }}>
              Nhận phản hồi nhanh chóng từ nhà tuyển dụng
            </p>
          </Card>
        </Col>
      </Row>
    </div>

    {/* Floating Chat Button */}
    <div style={{
      position: 'fixed',
      bottom: 30,
      right: 30,
      zIndex: 1000
    }}>
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        onClick={handleStartChat}
        style={{
          width: 60,
          height: 60,
          fontSize: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)',
          border: 'none'
        }}
      />
    </div>

    {/* Apply Modal */}
    <Modal
      title="Ứng tuyển công việc"
      open={applyModalOpen}
      onCancel={() => {
        setApplyModalOpen(false);
        form.resetFields();
      }}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleApplySubmit}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <strong>{job?.title}</strong>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            {job?.location} • {job?.salaryMin} - {job?.salaryMax}
          </div>
        </div>

        <Form.Item
          label="CV của bạn"
          name="cvUrl"
          rules={[{ required: true, message: 'Vui lòng upload CV hoặc nhập link CV' }]}
        >
          <CVUpload />
        </Form.Item>

        <Form.Item
          label="Thư xin việc"
          name="coverLetter"
          rules={[{ required: true, message: 'Vui lòng nhập thư xin việc' }]}
        >
          <Input.TextArea
            rows={6}
            placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setApplyModalOpen(false);
              form.resetFields();
            }}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={applyLoading}
              size="large"
            >
              Xem trước và gửi
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
    
    {/* Preview Profile Modal */}
    <Modal
      title="Xác nhận thông tin ứng tuyển"
      open={previewModalOpen}
      onCancel={() => setPreviewModalOpen(false)}
      width={800}
      footer={[
        <Button key="back" onClick={() => {
          setPreviewModalOpen(false);
          setApplyModalOpen(true);
        }}>
          Quay lại chỉnh sửa
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={applyLoading}
          onClick={handleConfirmApply}
          size="large"
        >
          Xác nhận ứng tuyển
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16, padding: 12, background: '#e6f7ff', borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          Thông tin này sẽ được gửi cho nhà tuyển dụng:
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>
          Vui lòng kiểm tra kỹ trước khi xác nhận
        </div>
      </div>
      
      {user?.id && (
        <CandidateProfileView 
          userId={user.id} 
          cvUrl={form.getFieldValue('cvUrl')}
        />
      )}
      
      <Card style={{ marginTop: 16 }} title="Thư xin việc">
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {form.getFieldValue('coverLetter')}
        </div>
      </Card>
    </Modal>
    </>
  );
};


