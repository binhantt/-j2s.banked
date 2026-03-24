import { Row, Col, Spin, message, Modal, Form, Card, Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { chatApi } from '@/lib/chatApi';
import { savedJobApi } from '@/lib/savedJobApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';
import { useJobDetailStore } from './store/useJobDetailStore';
import { JobDetailHeader } from './components/JobDetailHeader';
import { JobDescription } from './components/JobDescription';
import { JobComments } from './components/JobComments';
import { JobInfoSidebar } from './components/JobInfoSidebar';
import { ApplyModal } from './components/ApplyModal';
import { CandidateProfileView } from '@/features/applications/CandidateProfileView';

interface JobDetailFeatureProps {
  jobId: string;
}

export const JobDetailFeature = ({ jobId }: JobDetailFeatureProps) => {
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  const { canApplyJob } = usePermissions();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  
  const { job, loading, hasApplied, fetchJobDetail, incrementViews, setHasApplied } = useJobDetailStore();

  useEffect(() => {
    if (jobId && jobId !== 'undefined' && jobId !== 'null') {
      const numericJobId = Number(jobId);
      if (!isNaN(numericJobId)) {
        fetchJobDetail(numericJobId);
        incrementViews(numericJobId);
        checkApplied();
      }
    }
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

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để chat với HR');
      router.push('/login');
      return;
    }

    if (!job) return;

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

  const handleSaveJob = async () => {
    if (!isAuthenticated || !user?.id) {
      message.warning('Vui lòng đăng nhập để lưu tin');
      router.push('/login');
      return;
    }

    try {
      await savedJobApi.saveJob(user.id, Number(jobId));
      message.success('Đã lưu tin tuyển dụng');
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Có lỗi xảy ra';
      if (msg === 'Job already saved') {
        message.info('Bạn đã lưu tin này rồi');
      } else {
        message.error('Không thể lưu tin');
      }
    }
  };

  const handleApplySubmit = async () => {
    setApplyModalOpen(false);
    setPreviewModalOpen(true);
  };
  
  const handleConfirmApply = async () => {
    const values = form.getFieldsValue();
    
    if (!values.cvUrl || !values.coverLetter) {
      message.error('Vui lòng điền đầy đủ thông tin');
      setPreviewModalOpen(false);
      setApplyModalOpen(true);
      return;
    }
    
    setApplyLoading(true);
    try {
      const { applicationApi } = await import('@/lib/applicationApi');
      
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
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi ứng tuyển');
    } finally {
      setApplyLoading(false);
    }
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
            {/* Job Header */}
            <div style={{ 
              background: '#fff', 
              padding: 24, 
              borderRadius: 8, 
              marginBottom: 24,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
            }}>
              <JobDetailHeader
                job={job}
                onApply={handleApplyClick}
                onSave={handleSaveJob}
                canApply={canApplyJob}
                hasApplied={hasApplied}
              />
            </div>

            {/* Job Description */}
            <JobDescription title="MÔ TẢ CÔNG VIỆC" content={job.description} />

            {/* Job Requirements */}
            {job.requirements && (
              <JobDescription title="YÊU CẦU ỨNG VIÊN" content={job.requirements} />
            )}

            {/* Job Benefits */}
            {job.benefits && (
              <JobDescription title="QUYỀN LỢI" content={job.benefits} />
            )}

            {/* Comments Section */}
            <JobComments jobId={Number(jobId)} />
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <JobInfoSidebar 
              job={job} 
              onChatWithHR={handleStartChat}
              companyName={job.companyName}
            />
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
            boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
            background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
            border: 'none'
          }}
        />
      </div>

      {/* Apply Modal */}
      <ApplyModal
        open={applyModalOpen}
        job={job}
        form={form}
        loading={applyLoading}
        onCancel={() => {
          setApplyModalOpen(false);
          form.resetFields();
        }}
        onSubmit={handleApplySubmit}
      />

      {/* Preview Profile Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>Xác nhận thông tin ứng tuyển</span>
            <span style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 400 }}>
              Kiểm tra kỹ trước khi gửi hồ sơ
            </span>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        width={880}
        centered
        footer={[
          <Button
            key="back"
            size="large"
            onClick={() => {
              setPreviewModalOpen(false);
              setApplyModalOpen(true);
            }}
          >
            Quay lại chỉnh sửa
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={applyLoading}
            onClick={handleConfirmApply}
            size="large"
            style={{
              border: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}
          >
            Xác nhận ứng tuyển
          </Button>,
        ]}
      >
        <div
          style={{
            marginBottom: 16,
            padding: 14,
            background: '#f0fdf4',
            border: '1px solid #dcfce7',
            borderRadius: 10,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4, color: '#0f172a' }}>
            Thông tin này sẽ được gửi cho nhà tuyển dụng
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>
            Hãy đảm bảo CV và thư xin việc thể hiện đúng năng lực của bạn.
          </div>
        </div>

        {user?.id && (
          <CandidateProfileView
            userId={user.id}
            cvUrl={form.getFieldValue('cvUrl')}
          />
        )}

        <Card style={{ marginTop: 16, borderRadius: 12 }} title="Thư xin việc">
          <div style={{ whiteSpace: 'pre-wrap', color: '#374151', lineHeight: 1.7 }}>
            {form.getFieldValue('coverLetter')}
          </div>
        </Card>
      </Modal>
    </>
  );
};
