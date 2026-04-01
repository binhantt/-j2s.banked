import { Card, Form, Input, DatePicker, Button, message, List, Space, Popconfirm, InputNumber } from 'antd';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { educationApi } from '@/lib/profileApi';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Education {
  id?: number;
  userId: number;
  degree: string;
  school: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export const EducationManagement = () => {
  const { user } = useAuthStore();
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form] = Form.useForm();
  const [formAdd] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      loadEducations();
    }
  }, [user?.id]);

  const loadEducations = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await educationApi.getEducations(user.id);
      setEducations(data || []);
    } catch (error) {
      message.error('Không thể tải danh sách học vấn');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: any) => {
    try {
      await educationApi.createEducation({
        userId: user!.id,
        degree: values.degree,
        school: values.school,
        fieldOfStudy: values.fieldOfStudy,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        gpa: values.gpa,
        description: values.description,
      });
      message.success('Thêm học vấn thành công!');
      setIsAdding(false);
      formAdd.resetFields();
      await loadEducations();
    } catch (error) {
      message.error('Thêm học vấn thất bại!');
    }
  };

  const handleUpdate = async (id: number, values: any) => {
    try {
      await educationApi.updateEducation(id, {
        degree: values.degree,
        school: values.school,
        fieldOfStudy: values.fieldOfStudy,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        gpa: values.gpa,
        description: values.description,
      });
      message.success('Cập nhật học vấn thành công!');
      setEditingId(null);
      await loadEducations();
    } catch (error) {
      message.error('Cập nhật học vấn thất bại!');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await educationApi.deleteEducation(id);
      message.success('Xóa học vấn thành công!');
      await loadEducations();
    } catch (error) {
      message.error('Xóa học vấn thất bại!');
    }
  };

  const startEdit = (edu: Education) => {
    setEditingId(edu.id!);
    form.setFieldsValue({
      degree: edu.degree,
      school: edu.school,
      fieldOfStudy: edu.fieldOfStudy,
      dateRange: edu.startDate
        ? [dayjs(edu.startDate), edu.endDate ? dayjs(edu.endDate) : undefined]
        : undefined,
      gpa: edu.gpa,
      description: edu.description,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return dayjs(dateStr).format('MM/YYYY');
  };

  return (
    <div className="space-y-6">
      {/* Form thêm mới */}
      {isAdding && (
        <Card title="Thêm học vấn" size="small">
          <Form
            form={formAdd}
            layout="vertical"
            onFinish={handleAdd}
          >
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Bằng cấp / Chứng chỉ"
                name="degree"
                rules={[{ required: true, message: 'Vui lòng nhập bằng cấp' }]}
              >
                <Input placeholder="VD: Kỹ sư CNTT, Cử nhân..." />
              </Form.Item>
              <Form.Item
                label="Trường học"
                name="school"
                rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
              >
                <Input placeholder="VD: ĐH Bách Khoa TP.HCM" />
              </Form.Item>
              <Form.Item label="Chuyên ngành" name="fieldOfStudy">
                <Input placeholder="VD: Công nghệ thông tin" />
              </Form.Item>
              <Form.Item label="Điểm GPA" name="gpa">
                <Input placeholder="VD: 3.5/4.0" />
              </Form.Item>
              <Form.Item label="Thời gian học" name="dateRange" className="col-span-2">
                <RangePicker
                  style={{ width: '100%' }}
                  picker="month"
                  format="MM/YYYY"
                  placeholder={['Từ tháng', 'Đến tháng']}
                />
              </Form.Item>
              <Form.Item label="Mô tả / Thành tích" name="description" className="col-span-2">
                <TextArea rows={3} placeholder="Mô tả thêm về quá trình học tập, thành tích..." />
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
          Thêm học vấn
        </Button>
      )}

      {/* Danh sách học vấn */}
      {loading ? (
        <Card>Đang tải...</Card>
      ) : educations.length === 0 && !isAdding ? (
        <Card className="text-center py-8">
          <div className="text-gray-500">Chưa có thông tin học vấn nào</div>
        </Card>
      ) : (
        <List
          dataSource={educations}
          renderItem={(edu) => (
            <List.Item
              key={edu.id}
              actions={
                editingId === edu.id
                  ? []
                  : [
                      <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => startEdit(edu)}
                      />,
                      <Popconfirm
                        key="delete"
                        title="Xóa học vấn?"
                        onConfirm={() => handleDelete(edu.id!)}
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
                  editingId === edu.id ? (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={(values) => handleUpdate(edu.id!, values)}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="degree" rules={[{ required: true }]}>
                          <Input placeholder="Bằng cấp" />
                        </Form.Item>
                        <Form.Item name="school" rules={[{ required: true }]}>
                          <Input placeholder="Trường học" />
                        </Form.Item>
                        <Form.Item label="Chuyên ngành" name="fieldOfStudy">
                          <Input />
                        </Form.Item>
                        <Form.Item label="GPA" name="gpa">
                          <Input />
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
                    <strong>{edu.degree}</strong>
                  )
                }
                description={
                  editingId !== edu.id && (
                    <>
                      <div className="text-gray-600">
                        {edu.school}
                        {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                      </div>
                      {(edu.startDate || edu.endDate) && (
                        <div className="text-gray-400 text-sm">
                          {formatDate(edu.startDate)} {edu.endDate && `— ${formatDate(edu.endDate)}`}
                        </div>
                      )}
                      {edu.gpa && (
                        <div className="text-gray-500 text-sm">GPA: {edu.gpa}</div>
                      )}
                      {edu.description && (
                        <div className="text-gray-500 text-sm mt-1">{edu.description}</div>
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
