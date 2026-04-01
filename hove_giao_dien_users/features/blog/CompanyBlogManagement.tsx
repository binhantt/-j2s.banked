import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm,
  Tag,
  Space,
  Row,
  Col,
  Tooltip,
  Divider,
  Avatar,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  BoldOutlined,
  CodeOutlined,
  FacebookOutlined,
  InstagramOutlined,
  GlobalOutlined,
  UserOutlined,
  ArrowRightOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { useAuthStore } from '@/store/useAuthStore';

const { TextArea } = Input;
const { Option } = Select;

export default function CompanyBlogManagement() {
  const [blogs, setBlogs] = useState<CompanyBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<CompanyBlog | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    loadBlogs();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await companyBlogApi.getCategories();
    setCategories(data);
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      if (!user?.companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }
      
      const response = await companyBlogApi.getBlogsByCompany(user.companyId);
      setBlogs(response);
    } catch (error: any) {
      console.error('Error loading blogs:', error);
      message.error(error.message || 'Không thể tải danh sách blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBlog(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (blog: CompanyBlog) => {
    setEditingBlog(blog);
    form.setFieldsValue({
      title: blog.title,
      content: blog.content,
      imageUrl: blog.imageUrl,
      authorName: blog.authorName,
      status: blog.status,
      facebookLink: blog.facebookLink,
      instagramLink: blog.instagramLink,
      zaloLink: blog.zaloLink,
      tags: blog.tags,
      category: blog.category
    });
    setModalVisible(true);
  };

  const insertFormat = (tagOpen: string, tagClose: string) => {
    const textArea = textAreaRef.current?.resizableTextArea?.textArea;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const text = form.getFieldValue('content') || '';
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newText = `${beforeText}${tagOpen}${selectedText}${tagClose}${afterText}`;
    form.setFieldsValue({ content: newText });

    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 0);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!user?.companyId) {
        message.error('Không tìm thấy thông tin công ty');
        return;
      }

      const blogData: CompanyBlog = {
        companyId: user.companyId,
        title: values.title,
        content: values.content,
        imageUrl: values.imageUrl,
        authorName: values.authorName || user.name || 'Công ty',
        status: values.status || 'draft',
        facebookLink: values.facebookLink,
        instagramLink: values.instagramLink,
        zaloLink: values.zaloLink,
        tags: values.tags,
        category: values.category
      };

      if (editingBlog) {
        await companyBlogApi.updateBlog(editingBlog.id!, blogData);
        message.success('Cập nhật blog thành công');
      } else {
        await companyBlogApi.createBlog(blogData);
        message.success('Tạo blog thành công');
      }

      setModalVisible(false);
      loadBlogs();
    } catch (error: any) {
      console.error('Error saving blog:', error);
      message.error(error.message || 'Có lỗi xảy ra khi lưu blog');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await companyBlogApi.deleteBlog(id);
      message.success('Xóa blog thành công');
      loadBlogs();
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      message.error(error.message || 'Có lỗi xảy ra khi xóa blog');
    }
  };

  const columns = [
    {
      title: 'Thông tin bài viết',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: CompanyBlog) => (
        <Space size="middle">
          <Avatar 
            shape="square" 
            size={48} 
            src={record.imageUrl} 
            style={{ borderRadius: 12, border: '1px solid #f1f5f9' }}
            icon={<FileTextOutlined style={{ color: '#16a34a' }} />}
          />
          <div>
            <div className="font-black text-slate-800 text-lg mb-1">{text}</div>
            <div className="text-sm text-slate-400 flex items-center gap-4">
               <span><UserOutlined /> {record.authorName}</span>
               <span><EyeOutlined /> {record.views || 0} lượt xem</span>
               {record.category && <Tag color="#f0fdf4" style={{ color: '#16a34a', border: 'none', borderRadius: 4 }}>{record.category}</Tag>}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => (
        <Badge 
          status={status === 'published' ? 'success' : 'default'} 
          text={
            <Tag 
              color={status === 'published' ? '#f0fdf4' : '#f8fafc'} 
              style={{ color: status === 'published' ? '#16a34a' : '#64748b', border: 'none', fontWeight: 800, padding: '4px 12px', borderRadius: 100 }}
            >
              {status === 'published' ? 'Đã công khai' : 'Bản nháp'}
            </Tag>
          } 
        />
      ),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <span className="text-slate-500 font-medium">
          <ClockCircleOutlined className="mr-2" />
          {date ? new Date(date).toLocaleDateString('vi-VN') : '-'}
        </span>
      ),
    },
    {
      title: 'Quản lý',
      key: 'actions',
      width: 120,
      render: (_: any, record: CompanyBlog) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: '#16a34a' }} />}
              onClick={() => handleEdit(record)}
              className="hover:bg-green-50 rounded-lg"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa bài viết này?"
            description="Lưu ý: Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id!)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
               <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="hover:bg-red-50 rounded-lg"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-slate-50 min-vh-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
               Quản lý Blog <span className="text-green-600">Company</span>
            </h1>
            <p className="text-slate-500 text-lg">
               Chia sẻ câu chuyện, văn hóa và tin tức của công ty đến ứng viên tiềm năng.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            style={{ 
              height: 56, borderRadius: 16, fontWeight: 900, 
              background: 'linear-gradient(135deg, #16a34a, #22c55e)', 
              border: 'none', boxShadow: '0 10px 30px rgba(22,163,74,0.2)' 
            }}
            className="flex items-center px-8"
          >
            VIẾT BÀI MỚI <ArrowRightOutlined className="ml-2" />
          </Button>
        </div>

        <Card 
          style={{ borderRadius: 32, border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}
          styles={{ body: { padding: '24px' } }}
        >
          <Table
            columns={columns}
            dataSource={blogs}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng cộng ${total} bài viết`,
            }}
          />
        </Card>

        <Modal
          title={null}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={1000}
          destroyOnClose
          centered
          styles={{ body: { padding: 0 } }}
        >
          <div className="p-10">
            <div className="mb-8">
               <h2 className="text-2xl font-black text-slate-900 mb-2">
                 {editingBlog ? 'Cập nhật bài viết' : 'Bắt đầu bài viết mới'}
               </h2>
               <p className="text-slate-500">Hoàn thiện thông tin bên dưới để chia sẻ bài viết lên cộng đồng.</p>
            </div>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
               <Row gutter={32}>
                 <Col span={16}>
                    <Form.Item
                      name="title"
                      label={<span className="font-bold text-slate-600">TIÊU ĐỀ BÀI VIẾT</span>}
                      rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                    >
                      <Input placeholder="Tiêu đề gợi cảm hứng cho người đọc..." style={{ borderRadius: 14, height: 50 }} />
                    </Form.Item>

                    <Form.Item
                      name="content"
                      label={
                        <div className="flex justify-between items-center w-full mb-1">
                          <span className="font-bold text-slate-600 uppercase">Nội dung chi tiết</span>
                          <Space className="bg-slate-100 p-1 rounded-lg">
                            <Tooltip title="In đậm"><Button type="text" size="small" icon={<BoldOutlined />} onClick={() => insertFormat('<b>', '</b>')} /></Tooltip>
                            <Tooltip title="Định dạng Code"><Button type="text" size="small" icon={<CodeOutlined />} onClick={() => insertFormat('<pre><code>', '</code></pre>')} /></Tooltip>
                          </Space>
                        </div>
                      }
                      rules={[{ required: true, message: 'Nhập nội dung' }]}
                    >
                      <TextArea 
                        ref={textAreaRef}
                        rows={16} 
                        placeholder="Kể câu chuyện của bạn tại đây... (Hỗ trợ <b> và <code>)"
                        style={{ borderRadius: 18, padding: 20, border: '1.5px solid #f1f5f9' }}
                      />
                    </Form.Item>
                 </Col>

                 <Col span={8}>
                    <div className="space-y-6">
                       <Form.Item
                        name="authorName"
                        label={<span className="font-bold text-slate-600 uppercase">Tác giả hiển thị</span>}
                        rules={[{ required: true, message: 'Nhập tên tác giả' }]}
                      >
                        <Input prefix={<UserOutlined style={{ color: '#16a34a' }} />} style={{ borderRadius: 12 }} />
                      </Form.Item>

                      <Form.Item
                        name="category"
                        label={<span className="font-bold text-slate-600 uppercase">Chuyên mục</span>}
                        rules={[{ required: true, message: 'Chọn chuyên mục' }]}
                      >
                        <Select dropdownStyle={{ borderRadius: 12 }} placeholder="Chọn chuyên mục">
                          {categories.map(cat => (
                            <Option key={cat.id} value={cat.name}>{cat.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="status"
                        label={<span className="font-bold text-slate-600 uppercase">Trạng thái</span>}
                        rules={[{ required: true, message: 'Chọn trạng thái' }]}
                      >
                        <Select dropdownStyle={{ borderRadius: 12 }}>
                          <Option value="draft">Lưu bản nháp</Option>
                          <Option value="published">Xuất bản công khai</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="imageUrl"
                        label={<span className="font-bold text-slate-600 uppercase">Ảnh bìa (URL)</span>}
                      >
                        <Input prefix={<GlobalOutlined style={{ color: '#16a34a' }} />} placeholder="https://..." style={{ borderRadius: 12 }} />
                      </Form.Item>

                      <Divider style={{ margin: '12px 0' }} />

                      <div className="space-y-4">
                         <span className="font-bold text-slate-400 text-xs tracking-widest uppercase">Liên kết xã hội</span>
                         <Form.Item name="facebookLink" noStyle><Input prefix={<FacebookOutlined style={{ color: '#1877f2' }} />} placeholder="Facebook" style={{ borderRadius: 10, fontSize: 13, marginBottom: 12 }} /></Form.Item>
                         <Form.Item name="instagramLink" noStyle><Input prefix={<InstagramOutlined style={{ color: '#e4405f' }} />} placeholder="Instagram" style={{ borderRadius: 10, fontSize: 13, marginBottom: 12 }} /></Form.Item>
                         <Form.Item name="tags" noStyle><Input prefix={<TagsOutlined style={{ color: '#16a34a' }} />} placeholder="Tags (cách nhau dấu phẩy)" style={{ borderRadius: 10, fontSize: 13 }} /></Form.Item>
                      </div>

                      <div className="pt-6">
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          block 
                          size="large"
                          style={{ borderRadius: 16, height: 56, fontWeight: 900, background: '#16a34a', border: 'none', boxShadow: '0 8px 20px rgba(22,163,74,0.15)' }}
                        >
                          {editingBlog ? 'CẬP NHẬT NGAY' : 'XUẤT BẢN BÀI VIẾT'}
                        </Button>
                      </div>
                    </div>
                 </Col>
               </Row>
            </Form>
          </div>
        </Modal>
      </div>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: transparent !important;
          color: #94a3b8 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 11px !important;
          border-bottom: 2px solid #f8fafc !important;
        }
        .ant-table-tbody > tr > td {
          padding-top: 24px !important;
          padding-bottom: 24px !important;
        }
      `}</style>
    </div>
  );
}