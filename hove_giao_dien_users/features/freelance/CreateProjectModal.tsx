import { useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Button, Space, message, Divider, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { freelanceApi } from '@/lib/freelanceApi';
import dayjs from 'dayjs';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: number;
}

interface Milestone {
  title: string;
  percentage: number;
  dueDate?: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
  onSuccess,
  clientId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', percentage: 0, dueDate: undefined }
  ]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', percentage: 0, dueDate: undefined }]);
  };

  const handleRemoveMilestone = (index: number) => {
    const newMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(newMilestones);
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: any) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Validate milestones total percentage
      const totalPercentage = milestones
        .filter(m => m.title.trim())
        .reduce((sum, m) => sum + (m.percentage || 0), 0);

      if (totalPercentage > 100) {
        message.error('Tổng phần trăm các mốc không được vượt quá 100%');
        return;
      }

      // Create project
      const projectData = {
        clientId,
        title: values.title,
        description: values.description,
        budget: values.budget,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : undefined,
      };

      const project = await freelanceApi.createProject(projectData);

      // Create milestones
      const validMilestones = milestones.filter(m => m.title.trim());
      if (validMilestones.length > 0) {
        await Promise.all(
          validMilestones.map(milestone =>
            freelanceApi.createMilestone({
              projectId: project.id,
              title: milestone.title,
              percentage: milestone.percentage,
              status: 'pending',
              dueDate: milestone.dueDate,
            })
          )
        );
      }

      message.success('Tạo dự án thành công!');
      form.resetFields();
      setMilestones([{ title: '', percentage: 0, dueDate: undefined }]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      message.error('Tạo dự án thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setMilestones([{ title: '', percentage: 0, dueDate: undefined }]);
    onClose();
  };

  return (
    <Modal
      title="Tạo dự án Freelance mới"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Divider orientation="left">Thông tin dự án</Divider>

        <Form.Item
          name="title"
          label="Tiêu đề dự án"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề dự án' },
            { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự' },
          ]}
        >
          <Input placeholder="VD: Thiết kế website bán hàng online" size="large" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả dự án' },
            { min: 50, message: 'Mô tả phải có ít nhất 50 ký tự' },
          ]}
        >
          <Input.TextArea
            rows={6}
            placeholder="Mô tả chi tiết về dự án, yêu cầu kỹ thuật, tính năng cần có..."
          />
        </Form.Item>

        <Form.Item
          name="budget"
          label="Ngân sách (VNĐ)"
          rules={[
            { required: true, message: 'Vui lòng nhập ngân sách' },
            { type: 'number', min: 100000, message: 'Ngân sách tối thiểu 100,000 VNĐ' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            size="large"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            placeholder="VD: 20,000,000"
          />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Hạn hoàn thành"
          rules={[{ required: true, message: 'Vui lòng chọn hạn hoàn thành' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            size="large"
            format="DD/MM/YYYY"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            placeholder="Chọn ngày hạn chót"
          />
        </Form.Item>

        <Divider orientation="left">
          Các mốc quan trọng (Milestones)
          <span style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: 8 }}>
            - Tùy chọn
          </span>
        </Divider>

        <div style={{ marginBottom: 16 }}>
          {milestones.map((milestone, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: 12 }}
              extra={
                milestones.length > 1 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveMilestone(index)}
                  >
                    Xóa
                  </Button>
                )
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Input
                  placeholder="Tên mốc (VD: Thiết kế UI/UX)"
                  value={milestone.title}
                  onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                />
                <Space style={{ width: '100%' }}>
                  <InputNumber
                    style={{ width: 150 }}
                    min={0}
                    max={100}
                    placeholder="% dự án"
                    value={milestone.percentage}
                    onChange={(value) => handleMilestoneChange(index, 'percentage', value || 0)}
                    addonAfter="%"
                  />
                  <DatePicker
                    style={{ flex: 1 }}
                    format="DD/MM/YYYY"
                    placeholder="Hạn hoàn thành"
                    value={milestone.dueDate ? dayjs(milestone.dueDate) : null}
                    onChange={(date) => handleMilestoneChange(index, 'dueDate', date?.format('YYYY-MM-DD'))}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </Space>
              </Space>
            </Card>
          ))}

          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={handleAddMilestone}
          >
            Thêm mốc quan trọng
          </Button>

          <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
            Tổng phần trăm: {milestones.reduce((sum, m) => sum + (m.percentage || 0), 0)}%
            {milestones.reduce((sum, m) => sum + (m.percentage || 0), 0) > 100 && (
              <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                (Không được vượt quá 100%)
              </span>
            )}
          </div>
        </div>

        <Divider />

        <div style={{ 
          background: '#f0f2f5', 
          padding: '12px 16px', 
          borderRadius: '8px',
          marginBottom: 16,
          fontSize: '13px',
          color: '#595959'
        }}>
          <div style={{ marginBottom: 4 }}>
            💡 <strong>Lưu ý:</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Tiền ứng trước mặc định là 20% ngân sách dự án</li>
            <li>Dự án sẽ ở trạng thái "Nháp" cho đến khi bạn thanh toán tiền ứng</li>
            <li>Bạn có thể thêm/sửa milestones sau khi tạo dự án</li>
          </ul>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Tạo dự án
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
