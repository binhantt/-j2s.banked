import { useState, useEffect } from 'react';
import { Card, Button, List, Modal, Form, Input, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import { educationApi, Education } from '@/lib/profileApi';
import { useAuthStore } from '@/store/useAuthStore';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export const EducationManagement = () => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadEducations();
    }
  }, [user]);

  const loadEducations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await educationApi.getEducations(user.id);
      setEducations(data);
    } catch (error) {
      console.error('Load educations error:', error);
      message.error('Không thể tải danh sách học vấn');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!user?.id) return;

    try {
      const eduData = {
        userId: user.id,
        degree: values.degree,
        school: values.school,
        fieldOfStudy: values.fieldOfStudy,
        startDate: values.dates[0].format('YYYY-MM-DD'),
        endDate: values.dates[1] ? values.dates[1].format('YYYY-MM-DD') : null,
        gpa: values.gpa,
        description: values.description,
      };

      if (editingEdu) {
        await educationApi.updateEducation(editingEdu.id!, eduData);
        message.success('Cập nhật học vấn thành công');
      } else {
        await educationApi.createEducation(eduData);
        message.success('Thêm học vấn thành công');
      }
      
      setModalOpen(false);
      setEditingEdu(null);
      form.resetFields();
      loadEducations();
    } catch (error) {
      console.error('Save education error:', error);
      message.error('Có lỗi xảy ra');
    }
  };

  const handleEdit = (edu: Education) => {
    setEditingEdu(edu);
    form.setFieldsValue({
      degree: edu.degree,
      school: edu.school,
      fieldOfStudy: edu.fieldOfStudy,
      dates: [dayjs(edu.startDate), edu.endDate ? dayjs(edu.endDate) : null],
      gpa: edu.gpa,
      description: edu.description,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await educationApi.deleteEducation(id);
      message.success('Đã xóa học vấn');
      loadEducations();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Không thể xóa');
    }
  };

  const handleAddNew = () => {
    setEditingEdu(null);
    form.resetFields();
    setModalOpen(true);
  };

  return (
    <Card
      title="Học vấn"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm học vấn
        </Button>
      }
    >
      <List
        loading={loading}
        dataSource={educations}
        locale={{ emptyText: 'Chưa có thông tin học vấn. Hãy thêm học vấn đầu tiên!' }}
        renderItem={(edu) => (
          <List.Item
            actions={[
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(edu)}>
                Sửa
              </Button>,
              <Popconfirm
                title="Xóa học vấn"
                description="Bạn có chắc muốn xóa học vấn này?"
                onConfirm={() => handleDelete(edu.id!)}
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
              avatar={<BookOutlined style={{ fontSize: 32, color: '#52c41a' }} />}
              title={
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{edu.degree}</div>
                  <div style={{ color: '#666', fontSize: 14 }}>{edu.school}</div>
                </div>
              }
              description={
                <div>
                  <div style={{ marginBottom: 4 }}>
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

      <Modal
        title={editingEdu ? 'Chỉnh sửa học vấn' : 'Thêm học vấn mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingEdu(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Bằng cấp"
            name="degree"
            rules={[{ required: true, message: 'Vui lòng nhập bằng cấp' }]}
          >
            <Input placeholder="VD: Cử nhân, Thạc sĩ, Tiến sĩ..." size="large" />
          </Form.Item>

          <Form.Item
            label="Trường"
            name="school"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input placeholder="VD: Đại học Bách Khoa Hà Nội..." size="large" />
          </Form.Item>

          <Form.Item
            label="Chuyên ngành"
            name="fieldOfStudy"
          >
            <Input placeholder="VD: Công nghệ thông tin, Kinh tế..." size="large" />
          </Form.Item>

          <Form.Item
            label="Thời gian"
            name="dates"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <RangePicker size="large" style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item label="GPA" name="gpa">
            <Input placeholder="VD: 3.5/4.0" size="large" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={4} placeholder="Thành tích, hoạt động, giải thưởng..." />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setEditingEdu(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" size="large">
                {editingEdu ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
