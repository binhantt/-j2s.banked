import { Card, Form, Input, DatePicker, Button, message, List, Space, Popconfirm, Switch } from 'antd';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { experienceApi } from '@/lib/profileApi';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Experience {
  id?: number;
  userId: number;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export const ExperienceManagement = () => {
  const { user } = useAuthStore();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      loadExperiences();
    }
  }, [user?.id]);

  const loadExperiences = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await experienceApi.getExperiences(user.id);
      setExperiences(data || []);
    } catch (error) {
      message.error('Không thể tải danh sách kinh nghiệm');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: any) => {
    try {
      await experienceApi.createExperience({
        userId: user!.id,
        title: values.title,
        company: values.company,
        location: values.location,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        isCurrent: values.isCurrent || false,
        description: values.description,
      });
      message.success('Thêm kinh nghiệm thành công!');
      setIsAdding(false);
      formAdd.resetFields();
      await loadExperiences();
    } catch (error) {
      message.error('Thêm kinh nghiệm thất bại!');
    }
  };

  const handleUpdate = async (id: number, values: any) => {
    try {
      await experienceApi.updateExperience(id, {
        title: values.title,
        company: values.company,
        location: values.location,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.isCurrent ? null : values.dateRange?.[1]?.format('YYYY-MM-DD'),
        isCurrent: values.isCurrent || false,
        description: values.description,
      });
      message.success('Cập nhật kinh nghiệm thành công!');
      setEditingId(null);
      await loadExperiences();
    } catch (error) {
      message.error('Cập nhật kinh nghiệm thất bại!');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await experienceApi.deleteExperience(id);
      message.success('Xóa kinh nghiệm thành công!');
      await loadExperiences();
    } catch (error) {
      message.error('Xóa kinh nghiệm thất bại!');
    }
  };

  const startEdit = (exp: Experience) => {
    setEditingId(exp.id!);
    form.setFieldsValue({
      title: exp.title,
      company: exp.company,
      location: exp.location,
      dateRange: exp.startDate
        ? [dayjs(exp.startDate), exp.endDate ? dayjs(exp.endDate) : undefined]
        : undefined,
      isCurrent: exp.isCurrent,
      description: exp.description,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Hiện tại';
    return dayjs(dateStr).format('MM/YYYY');
  };

  return (
    <div className="space-y-6">
      {/* Form thêm mới */}
      {isAdding && (
        <Card title="Thêm kinh nghiệm làm việc" size="small">
          <Form
            form={formAdd}
            layout="vertical"
            onFinish={handleAdd}
          >
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Chức danh"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập chức danh' }]}
              >
                <Input placeholder="VD: Frontend Developer" />
              </Form.Item>
              <Form.Item
                label="Công ty"
                name="company"
                rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
              >
                <Input placeholder="VD: ABC Corp" />
              </Form.Item>
              <Form.Item label="Địa điểm" name="location">
                <Input placeholder="VD: TP.HCM" />
              </Form.Item>
              <Form.Item label="Công việc hiện tại" name="isCurrent" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="Thời gian làm việc" name="dateRange" className="col-span-2">
                <RangePicker
                  style={{ width: '100%' }}
                  picker="month"
                  format="MM/YYYY"
                  placeholder={['Từ tháng', 'Đến tháng']}
                />
              </Form.Item>
              <Form.Item label="Mô tả công việc" name="description" className="col-span-2">
                <TextArea rows={3} placeholder="Mô tả công việc, trách nhiệm..." />
              </Form.Item>
            </div>
            <Space>
              <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                Lưu
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setIsAdding(false);
                  formAdd.resetFields();
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      {/* Nút thêm */}
      {!isAdding && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAdding(true)}
          size="large"
        >
          Thêm kinh nghiệm
        </Button>
      )}

      {/* Danh sách kinh nghiệm */}
      {loading ? (
        <Card>Đang tải...</Card>
      ) : experiences.length === 0 && !isAdding ? (
        <Card className="text-center py-8">
          <div className="text-gray-500">Chưa có kinh nghiệm làm việc nào</div>
        </Card>
      ) : (
        <List
          dataSource={experiences}
          renderItem={(exp) => (
            <List.Item
              key={exp.id}
              actions={
                editingId === exp.id
                  ? []
                  : [
                      <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => startEdit(exp)}
                      />,
                      <Popconfirm
                        key="delete"
                        title="Xóa kinh nghiệm?"
                        onConfirm={() => handleDelete(exp.id!)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]
              }
            >
              <List.Item.Meta
                title={
                  editingId === exp.id ? (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={(values) => handleUpdate(exp.id!, values)}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="title" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                        <Form.Item name="company" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                        <Form.Item label="Địa điểm" name="location">
                          <Input />
                        </Form.Item>
                        <Form.Item label="Công việc hiện tại" name="isCurrent" valuePropName="checked">
                          <Switch />
                        </Form.Item>
                        <Form.Item label="Thời gian" name="dateRange" className="col-span-2">
                          <RangePicker
                            style={{ width: '100%' }}
                            picker="month"
                            format="MM/YYYY"
                          />
                        </Form.Item>
                        <Form.Item label="Mô tả" name="description" className="col-span-2">
                          <TextArea rows={2} />
                        </Form.Item>
                      </div>
                      <Space>
                        <Button type="primary" htmlType="submit" size="small">
                          Lưu
                        </Button>
                        <Button size="small" onClick={cancelEdit}>
                          Hủy
                        </Button>
                      </Space>
                    </Form>
                  ) : (
                    <span>
                      <strong>{exp.title}</strong>
                      {exp.isCurrent && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Hiện tại
                        </span>
                      )}
                    </span>
                  )
                }
                description={
                  editingId !== exp.id && (
                    <>
                      <div className="text-gray-600">
                        {exp.company} {exp.location && `• ${exp.location}`}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                      </div>
                      {exp.description && (
                        <div className="text-gray-500 text-sm mt-1">{exp.description}</div>
                      )}
                    </>
                  )
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};
