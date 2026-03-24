import { Modal, Form, Input, Button, Space } from 'antd';
import { CVUpload } from '@/components/CVUpload';

interface ApplyModalProps {
  open: boolean;
  job: any;
  form: any;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export const ApplyModal = ({
  open,
  job,
  form,
  loading,
  onCancel,
  onSubmit
}: ApplyModalProps) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>Ứng tuyển công việc</span>
          <span style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 400 }}>
            Hoàn thiện hồ sơ để gửi đến nhà tuyển dụng
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={680}
      centered
      styles={{
        body: { paddingTop: 8 },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            background: '#f0fdf4',
            border: '1px solid #dcfce7',
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#0b1220' }}>
            {job?.title}
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 6 }}>
            {job?.companyName || 'Công ty tuyển dụng'}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {job?.location} • {job?.salaryMin} - {job?.salaryMax}
          </div>
        </div>

        <Form.Item
          label={<span style={{ fontWeight: 600 }}>CV của bạn</span>}
          name="cvUrl"
          rules={[{ required: true, message: 'Vui lòng upload CV hoặc nhập link CV' }]}
        >
          <CVUpload />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Thư xin việc</span>}
          name="coverLetter"
          rules={[{ required: true, message: 'Vui lòng nhập thư xin việc' }]}
        >
          <Input.TextArea
            rows={7}
            showCount
            maxLength={2000}
            placeholder="Giới thiệu điểm mạnh, kinh nghiệm liên quan và lý do bạn phù hợp với vị trí này..."
            style={{ borderRadius: 10 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 4 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end', gap: 10 }}>
            <Button size="large" onClick={onCancel}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                border: 'none',
                paddingInline: 22,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                borderRadius: 10,
              }}
            >
              Xem trước và gửi
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
