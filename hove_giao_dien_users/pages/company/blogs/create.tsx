import { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  message, 
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Tooltip,
  Avatar
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined,
  BoldOutlined,
  CodeOutlined,
  FacebookOutlined,
  InstagramOutlined,
  GlobalOutlined,
  UserOutlined,
  TagsOutlined,
  FileImageOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import { companyBlogApi, CompanyBlog } from '@/lib/companyBlogApi';
import { companyApi } from '@/lib/companyApi';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/router';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function CreateBlogPage() {
  const [loading, setLoading] = useState(false);
  const [checkingCompany, setCheckingCompany] = useState(true);
  const [form] = Form.useForm();
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const textAreaRef = useRef<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await companyBlogApi.getCategories();
    setCategories(data);
  };

  useEffect(() => {
    if (!user) {
      return;
    }
    
    if (user.userType !== 'hr') {
      message.error('Bạn không có quyền truy cập trang này');
      router.push('/');
      return;
    }

    checkCompanyExists();
  }, [user, router]);

  const checkCompanyExists = async () => {
    if (!user?.id) return;
    
    setCheckingCompany(true);
    try {
      const company = await companyApi.getCompanyByHrId(user.id);
      
      if (!company) {
        message.warning('Bạn chưa tạo công ty. Vui lòng tạo công ty trước khi đăng blog.');
        router.push('/company/manage');
        return;
      }
      
      if (company.id && !user.companyId) {
        updateUser({ ...user, companyId: company.id });
      }
    } catch (error: any) {
      console.error('Error checking company:', error);
      message.error('Không thể kiểm tra thông tin công ty');
      router.push('/company/manage');
    } finally {
      setCheckingCompany(false);
    }
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
    if (!user?.id) {
      message.error('Không tìm thấy thông tin người dùng');
      return;
    }

    setLoading(true);
    try {
      const company = await companyApi.getCompanyByHrId(user.id);
      
      if (!company?.id) {
        message.error('Không tìm thấy thông tin công ty');
        router.push('/company/manage');
        return;
      }

      const blogData: CompanyBlog = {
        companyId: company.id,
        title: values.title,
        content: values.content,
        imageUrl: values.imageUrl,
        authorName: values.authorName || user.name || 'Công ty',
        status: values.status || 'draft',
        facebookLink: values.facebookLink,
        instagramLink: values.instagramLink,
        zaloLink: values.zaloLink,
        tags: values.tags
      };

      await companyBlogApi.createBlog(blogData);
      message.success('Tạo blog thành công');
      router.push('/company/blogs');
    } catch (error: any) {
      console.error('Error creating blog:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tạo blog');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/company/blogs');
  };

  if (checkingCompany) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-6"></div>
            <p className="text-slate-500 font-bold text-lg">Đang kiểm tra thông tin công ty...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header Section */}
          <div className="mb-10 flex justify-between items-end">
            <div>
              <Button 
                type="text"
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                className="mb-4 pl-0 text-slate-500 hover:text-green-600 font-bold"
              >
                QUAY LẠI DANH SÁCH
              </Button>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Viết Bài <span className="text-green-600">Blog Mới</span>
              </h1>
              <p className="text-slate-500 text-lg">Chia sẻ những câu chuyện và giá trị của doanh nghiệp đến cộng đồng.</p>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            initialValues={{
              authorName: user?.name || '',
              status: 'draft'
            }}
          >
            <Row gutter={32}>
              {/* Main Content Area */}
              <Col span={16}>
                <Card 
                  style={{ borderRadius: 32, border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}
                  styles={{ body: { padding: 40 } }}
                >
                  <Form.Item
                    name="title"
                    label={<span className="font-bold text-slate-500 tracking-wider text-[11px] mb-2 block">TIÊU ĐỀ BÀI VIẾT</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input 
                        placeholder="Ví dụ: Văn hóa làm việc tại ngôi nhà chung..." 
                        style={{ borderRadius: 16, height: 60, fontSize: 20, fontWeight: 900, border: '2px solid #e2e8f0', boxShadow: 'none' }} 
                    />
                  </Form.Item>

                  <div className="flex justify-between items-center mt-10 mb-4">
                     <span className="font-bold text-slate-500 tracking-wider text-[11px]">NỘI DUNG CHI TIẾT</span>
                     <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1">
                        <Tooltip title="In đậm"><Button type="text" size="small" className="hover:bg-white rounded-xl h-10 w-10 flex items-center justify-center transition-all" icon={<BoldOutlined className="text-slate-600" />} onClick={() => insertFormat('<b>', '</b>')} /></Tooltip>
                        <Tooltip title="Định dạng Code"><Button type="text" size="small" className="hover:bg-white rounded-xl h-10 w-10 flex items-center justify-center transition-all" icon={<CodeOutlined className="text-slate-600" />} onClick={() => insertFormat('<pre><code>', '</code></pre>')} /></Tooltip>
                        <Tooltip title="Gắn liên kết"><Button type="text" size="small" className="hover:bg-white rounded-xl h-10 w-10 flex items-center justify-center transition-all" icon={<GlobalOutlined className="text-slate-600" />} onClick={() => insertFormat('<a href="#">', '</a>')} /></Tooltip>
                     </div>
                  </div>
                  <Form.Item
                    name="content"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <TextArea 
                      ref={textAreaRef}
                      rows={18} 
                      placeholder="Kể lại câu chuyện của bạn... Hỗ trợ định dạng In đậm và Code Block."
                      style={{ borderRadius: 24, padding: 28, border: '2px solid #e2e8f0', fontSize: 17, lineHeight: 1.8, background: '#fff', boxShadow: 'none' }}
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Sidebar Settings Area */}
              <Col span={8}>
                <Card 
                  style={{ borderRadius: 32, border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', position: 'sticky', top: 40 }}
                  styles={{ body: { padding: 32 } }}
                >
                  <Space direction="vertical" size={24} className="w-full">
                    <div>
                        <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                           <CheckCircleOutlined className="text-green-600" /> Xuất bản
                        </Title>
                        <Form.Item
                            name="authorName"
                            label={<span className="text-[11px] font-black text-slate-400 tracking-wider">TÁC GIẢ</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
                        >
                            <Input prefix={<UserOutlined className="text-green-600 mr-2" />} style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', height: 44 }} />
                        </Form.Item>

                        <Form.Item
                            name="category"
                            label={<span className="text-[11px] font-black text-slate-400 tracking-wider">CHUYÊN MỤC</span>}
                            rules={[{ required: true, message: 'Chọn chuyên mục' }]}
                        >
                            <Select dropdownStyle={{ borderRadius: 12 }} style={{ height: 44 }} placeholder="Chọn chuyên mục">
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.name}>{cat.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label={<span className="text-[11px] font-black text-slate-400 tracking-wider">TRẠNG THÁI</span>}
                            rules={[{ required: true, message: 'Chọn trạng thái' }]}
                        >
                            <Select dropdownStyle={{ borderRadius: 12 }} style={{ height: 44 }}>
                            <Option value="draft">Lưu bản nháp</Option>
                            <Option value="published">Công khai ngay</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="imageUrl"
                            label={<span className="text-[11px] font-black text-slate-400 tracking-wider">ẢNH BÌA (URL)</span>}
                        >
                            <Input prefix={<FileImageOutlined className="text-green-600 mr-2" />} placeholder="https://..." style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', height: 44 }} />
                        </Form.Item>
                    </div>

                    <Divider style={{ margin: 0 }} />

                    <div>
                        <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
                           <TagsOutlined className="text-green-600" /> Định danh bài viết
                        </Title>
                        <Form.Item name="facebookLink" noStyle>
                            <Input prefix={<FacebookOutlined style={{ color: '#1877f2' }} className="mr-2" />} placeholder="Link Facebook" className="mb-4" style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', height: 44 }} />
                        </Form.Item>
                        <Form.Item name="instagramLink" noStyle>
                            <Input prefix={<InstagramOutlined style={{ color: '#e4405f' }} className="mr-2" />} placeholder="Link Instagram" className="mb-4" style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', height: 44 }} />
                        </Form.Item>
                        <Form.Item name="tags" noStyle>
                            <Input prefix={<TagsOutlined className="text-green-600 mr-2" />} placeholder="Tags (cách nhau dấu phẩy)" style={{ borderRadius: 12, border: '1.5px solid #e2e8f0', height: 44 }} />
                        </Form.Item>
                    </div>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        block 
                        size="large"
                        icon={<RocketOutlined />}
                        style={{ 
                            borderRadius: 16, height: 60, fontWeight: 900, 
                            background: 'linear-gradient(135deg, #16a34a, #22c55e)', 
                            border: 'none', boxShadow: '0 10px 25px rgba(22,163,74,0.2)',
                            marginTop: 12
                        }}
                    >
                        PHÁT HÀNH BÀI VIẾT
                    </Button>
                    <Button onClick={handleBack} block type="text" style={{ fontWeight: 800, color: '#94a3b8' }}>
                         HỦY BỎ
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </MainLayout>
  );
}