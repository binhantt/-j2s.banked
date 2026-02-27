import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, message, Alert, Space } from 'antd';
import { DollarOutlined, ClockCircleOutlined, FileTextOutlined, TrophyOutlined } from '@ant-design/icons';
import { freelanceApi } from '@/lib/freelanceApi';
import { api } from '@/lib/api';

const { TextArea } = Input;

interface ApplyProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  projectTitle: string;
  projectBudget: number;
  freelancerId: number;
  existingApplication?: any;
}

export const ApplyProjectModal = ({
  visible,
  onClose,
  onSuccess,
  projectId,
  projectTitle,
  projectBudget,
  freelancerId,
  existingApplication,
}: ApplyProjectModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [checkingCertificate, setCheckingCertificate] = useState(true);
  const [defaultCV, setDefaultCV] = useState<string>('');
  const [cvTitle, setCvTitle] = useState<string>('');

  useEffect(() => {
    if (visible) {
      checkCertificate();
      loadDefaultCV();
      if (existingApplication) {
        // Load existing application data
        form.setFieldsValue({
          proposedPrice: existingApplication.proposedPrice,
          estimatedDuration: existingApplication.estimatedDuration,
          coverLetter: existingApplication.coverLetter,
          achievements: existingApplication.achievements || '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, existingApplication]);

  const checkCertificate = async () => {
    setCheckingCertificate(true);
    try {
      const response = await api.get(`/api/users/${freelancerId}`);
      const userData = response.data;
      setHasCertificate(userData.certificateImages && userData.certificateImages.trim() !== '');
    } catch (error) {
      console.error('Check certificate error:', error);
      setHasCertificate(false);
    } finally {
      setCheckingCertificate(false);
    }
  };

  const loadDefaultCV = async () => {
    try {
      const response = await api.get(`/api/user-cvs/user/${freelancerId}`);
      const cvs = response.data;
      
      // Priority: 1. Default CV, 2. Public/Application_only CV, 3. First CV
      let selectedCV = cvs.find((cv: any) => cv.isDefault);
      
      if (!selectedCV) {
        // Find public or application_only CV
        selectedCV = cvs.find((cv: any) => 
          cv.visibility === 'public' || cv.visibility === 'application_only'
        );
      }
      
      if (!selectedCV && cvs.length > 0) {
        // Use first CV as fallback
        selectedCV = cvs[0];
      }
      
      if (selectedCV) {
        console.log('Selected CV for application:', selectedCV.title, selectedCV.fileUrl);
        setDefaultCV(selectedCV.fileUrl);
        setCvTitle(selectedCV.title || 'CV');
      } else {
        console.log('No CV found for user');
      }
    } catch (error) {
      console.error('Load default CV error:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!hasCertificate) {
      message.error('Bạn cần tải lên ảnh chứng chỉ/bằng cấp trước khi ứng tuyển!');
      return;
    }

    setLoading(true);
    try {
      console.log('Applying with CV:', defaultCV);
      await freelanceApi.applyToProject({
        projectId,
        freelancerId,
        proposedPrice: values.proposedPrice,
        estimatedDuration: values.estimatedDuration,
        coverLetter: values.coverLetter,
        achievements: values.achievements,
        cvUrl: defaultCV, // Attach CV
      });
      message.success('Ứng tuyển thành công! Client sẽ liên hệ với bạn sớm.');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Apply error:', error);
      message.error(error.response?.data?.message || 'Ứng tuyển thất bại');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          🚀 Ứng tuyển dự án
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {!hasCertificate && !checkingCertificate && (
        <Alert
          message="Cần có chứng chỉ/bằng cấp"
          description={
            <div>
              Bạn cần tải lên ảnh chứng chỉ/bằng cấp trong trang Hồ sơ trước khi ứng tuyển.
              <div style={{ marginTop: 8 }}>
                <Button type="link" href="/profile" style={{ padding: 0 }}>
                  Đi đến trang Hồ sơ →
                </Button>
              </div>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <div style={{
        padding: '16px',
        background: '#f0f5ff',
        borderRadius: '8px',
        marginBottom: 24,
        border: '1px solid #adc6ff'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#1890ff' }}>
          📋 {projectTitle}
        </div>
        <div style={{ fontSize: 14, color: '#595959' }}>
          <strong>Ngân sách:</strong> {formatCurrency(projectBudget)}
        </div>
        {defaultCV && (
          <div style={{ fontSize: 13, color: '#52c41a', marginTop: 8 }}>
            ✅ CV sẽ được gửi kèm: <strong>{cvTitle}</strong>
          </div>
        )}
        {!defaultCV && (
          <div style={{ fontSize: 13, color: '#faad14', marginTop: 8 }}>
            ⚠️ Bạn chưa có CV. Vui lòng tải CV lên trong trang Hồ sơ
          </div>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label={
            <Space>
              <DollarOutlined />
              <span>Giá đề xuất của bạn</span>
            </Space>
          }
          name="proposedPrice"
          rules={[
            { required: true, message: 'Vui lòng nhập giá đề xuất!' },
            { type: 'number', min: 1000000, message: 'Giá tối thiểu là 1,000,000 VNĐ' },
          ]}
          extra="Đề xuất mức giá bạn mong muốn nhận cho dự án này"
        >
          <InputNumber
            size="large"
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            addonAfter="VNĐ"
            placeholder="VD: 15000000"
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <ClockCircleOutlined />
              <span>Thời gian hoàn thành ước tính</span>
            </Space>
          }
          name="estimatedDuration"
          rules={[
            { required: true, message: 'Vui lòng nhập thời gian ước tính!' },
            { type: 'number', min: 1, message: 'Thời gian tối thiểu là 1 ngày' },
          ]}
          extra="Số ngày bạn cần để hoàn thành dự án"
        >
          <InputNumber
            size="large"
            style={{ width: '100%' }}
            min={1}
            addonAfter="ngày"
            placeholder="VD: 30"
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <FileTextOutlined />
              <span>Thư giới thiệu</span>
            </Space>
          }
          name="coverLetter"
          rules={[
            { required: true, message: 'Vui lòng viết thư giới thiệu!' },
            { min: 50, message: 'Thư giới thiệu cần ít nhất 50 ký tự' },
          ]}
          extra="Giới thiệu về bản thân, kinh nghiệm và lý do bạn phù hợp với dự án"
        >
          <TextArea
            rows={6}
            placeholder="VD: Tôi có 5 năm kinh nghiệm phát triển web với React và Node.js. Tôi đã hoàn thành nhiều dự án tương tự..."
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <TrophyOutlined />
              <span>Giải thưởng / Thành tích nổi bật</span>
            </Space>
          }
          name="achievements"
          extra="Các giải thưởng, chứng chỉ hoặc thành tích đáng chú ý (không bắt buộc)"
        >
          <TextArea
            rows={4}
            placeholder="VD: - Giải nhất cuộc thi Hackathon 2023&#10;- Chứng chỉ AWS Solutions Architect&#10;- Top 10 developer trên GitHub Vietnam"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <div style={{
          padding: '16px',
          background: '#fff7e6',
          borderRadius: '8px',
          marginBottom: 24,
          border: '1px solid #ffd591'
        }}>
          <div style={{ fontSize: 13, color: '#d46b08', marginBottom: 8 }}>
            💡 <strong>Lưu ý:</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#8c8c8c' }}>
            <li>Giá đề xuất nên hợp lý và cạnh tranh</li>
            <li>Thời gian hoàn thành cần thực tế</li>
            <li>Thư giới thiệu chi tiết sẽ tăng cơ hội được chọn</li>
            <li>Giải thưởng/thành tích giúp bạn nổi bật hơn</li>
          </ul>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} size="large">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              disabled={!hasCertificate}
              style={{
                background: hasCertificate 
                  ? 'linear-gradient(to right, #2563eb, #0891b2, #14b8a6)'
                  : undefined,
                border: 'none',
              }}
            >
              {existingApplication ? 'Cập nhật đơn ứng tuyển' : 'Gửi đơn ứng tuyển'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
