import { useState, useEffect } from 'react';
import { Card, Button, List, Modal, Form, Input, DatePicker, message, Popconfirm, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ToolOutlined } from '@ant-design/icons';
import { experienceApi, Experience } from '@/lib/profileApi';
import { useAuthStore } from '@/store/useAuthStore';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export const ExperienceManagement = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadExperiences();
    }
  }, [user]);

  const loadExperiences = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await experienceApi.getExperiences(user.id);
      setExperiences(data);
    } catch (error) {
      console.error('Load experiences error:', error);
      message.error('Không thể tải danh sách kinh nghiệm');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!user?.id) return;

    try {
      const expData = {
        userId: user.id,
        title: values.title,
        company: values.company,
        location: values.location,
        startDate: values.dates[0].format('YYYY-MM-DD'),
        endDate: values.isCurrent ? null : values.dates[1].format('YYYY-MM-DD'),
        isCurrent: values.isCurrent || false,
        description: values.description,
      };

      if (editingExp) {
        await experienceApi.updateExperience(editingExp.id!, expData);
        message.success('Cập nhật kinh nghiệm thành công');
      } else {
        await experienceApi.createExperience(expData);
        message.success('Thêm kinh nghiệm thành công');
      }
      
      setModalOpen(false);
      setEditingExp(null);
      form.resetFields();
      loadExperiences();
    } catch (error) {
      console.error('Save experience error:', error);
      message.error('Có lỗi xảy ra');
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditingExp(exp);
    form.setFieldsValue({
      title: exp.title,
      company: exp.company,
      location: exp.location,
      dates: [dayjs(exp.startDate), exp.endDate ? dayjs(exp.endDate) : null],
      isCurrent: exp.isCurrent,
      description: exp.description,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await experienceApi.deleteExperience(id);
      message.success('Đã xóa kinh nghiệm');
      loadExperiences();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Không thể xóa');
    }
  };

  const handleAddNew = () => {
    setEditingExp(null);
    form.resetFields();
    setModalOpen(true);
  };

  return (
    <Card
      title="Kinh nghiệm làm việc"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm kinh nghiệm
        </Button>
      }
    >
      <List
        loading={loading}
        dataSource={experiences}
        locale={{ emptyText: 'Chưa có kinh nghiệm nào. Hãy thêm kinh nghiệm đầu tiên!' }}
        renderItem={(exp) => (
          <List.Item
            actions={[
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(exp)}>
                Sửa
              </Button>,
              <Popconfirm
                title="Xóa kinh nghiệm"
                description="Bạn có chắc muốn xóa kinh nghiệm này?"
                onConfirm={() => handleDelete(exp.id!)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={<ToolOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
              title={
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{exp.title}</div>
                  <div style={{ color: '#666', fontSize: 14 }}>{exp.company}</div>
                </div>
              }
              description={
                <div>
                  <div style={{ marginBottom: 4 }}>
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

      <Modal
        title={editingExp ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingExp(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Vị trí"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
          >
            <Input placeholder="VD: Senior Software Engineer" size="large" />
          </Form.Item>

          <Form.Item
            label="Công ty"
            name="company"
            rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
          >
            <Input placeholder="VD: Google, Microsoft..." size="large" />
          </Form.Item>

          <Form.Item
            label="Địa điểm"
            name="location"
          >
            <Input placeholder="VD: Hà Nội, TP.HCM..." size="large" />
          </Form.Item>

          <Form.Item
            label="Thời gian"
            name="dates"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <RangePicker size="large" style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="isCurrent" valuePropName="checked">
            <Checkbox>Đang làm việc tại đây</Checkbox>
          </Form.Item>

          <Form.Item label="Mô tả công việc" name="description">
            <TextArea rows={4} placeholder="Mô tả công việc, trách nhiệm, thành tích..." />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingExp(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" size="large">
                {editingExp ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
