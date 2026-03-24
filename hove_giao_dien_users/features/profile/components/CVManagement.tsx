import { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Upload, message, Tag, Space, Popconfirm, Select, Tooltip, notification } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, EyeOutlined, StarOutlined, StarFilled, EditOutlined, FilePdfOutlined, FileWordOutlined, FileTextOutlined, ShareAltOutlined, CopyOutlined } from '@ant-design/icons';
import { cvApi, CV } from '@/lib/cvApi';
import { uploadApi } from '@/lib/uploadApi';
import { useAuthStore } from '@/store/useAuthStore';
import type { ColumnsType } from 'antd/es/table';

export const CVManagement = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCV, setEditingCV] = useState<CV | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadCVs();
    }
  }, [user]);

  const loadCVs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('Loading CVs for user:', user.id);
      const data = await cvApi.getUserCVs(user.id);
      console.log('CVs loaded:', data);
      console.log('Number of CVs:', data.length);
      
      // Debug: Check for duplicate IDs or titles
      const ids = data.map(cv => cv.id);
      const titles = data.map(cv => cv.title);
      console.log('CV IDs:', ids);
      console.log('CV Titles:', titles);
      console.log('Duplicate IDs:', ids.filter((id, index) => ids.indexOf(id) !== index));
      console.log('Duplicate Titles:', titles.filter((title, index) => titles.indexOf(title) !== index));
      
      setCvs(data);
    } catch (error: any) {
      console.error('Error loading CVs:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể tải danh sách CV';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const fileName = file.name.toLowerCase();
    const isValidType = validTypes.includes(file.type) || 
                       fileName.endsWith('.pdf') || 
                       fileName.endsWith('.doc') || 
                       fileName.endsWith('.docx');

    if (!isValidType) {
      message.error('Chỉ chấp nhận file PDF, DOC, hoặc DOCX');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 10MB');
      return false;
    }

    setUploading(true);
    try {
      const title = form.getFieldValue('title') || file.name.replace(/\.[^/.]+$/, '');
      const result = await uploadApi.uploadCV(file, user!.id, title);
      
      // Lưu ID của CV đã được tạo tự động
      form.setFieldsValue({
        cvId: result.id,
        fileUrl: result.url,
        fileName: result.filename,
        fileSize: result.size,
      });
      
      message.success('Upload CV thành công!');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Upload thất bại');
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleSubmit = async (values: any) => {
    if (!user?.id) return;

    try {
      console.log('Submitting CV form:', values);
      
      if (editingCV) {
        console.log('Updating CV:', editingCV.id);
        await cvApi.updateCV(editingCV.id!, {
          title: values.title,
          visibility: values.visibility,
        });
        message.success('Cập nhật CV thành công!');
      } else {
        // CV đã được lưu tự động khi upload, chỉ cần cập nhật visibility nếu khác private
        const cvId = form.getFieldValue('cvId');
        console.log('CV ID from form:', cvId, 'Visibility:', values.visibility);
        
        if (cvId && values.visibility !== 'private') {
          console.log('Updating CV privacy:', cvId, values.visibility);
          await cvApi.updatePrivacy(cvId, user.id, values.visibility);
        }
        message.success('Thêm CV thành công!');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingCV(null);
      loadCVs();
    } catch (error: any) {
      console.error('Error submitting CV:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra!';
      message.error(errorMessage);
    }
  };

  const handleSetDefault = async (cv: CV) => {
    if (!user?.id) return;
    
    try {
      console.log('Setting CV as default:', cv.id);
      await cvApi.setAsDefault(cv.id!, user.id);
      message.success('Đã đặt làm CV mặc định!');
      loadCVs();
    } catch (error: any) {
      console.error('Error setting default CV:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể đặt làm mặc định';
      message.error(errorMessage);
    }
  };

  const handleDelete = async (cv: CV) => {
    try {
      console.log('Deleting CV:', cv.id);
      await cvApi.deleteCV(cv.id!);
      message.success('Đã xóa CV!');
      loadCVs();
    } catch (error: any) {
      console.error('Error deleting CV:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa CV';
      message.error(errorMessage);
    }
  };

  const handleShare = async (cv: CV) => {
    if (!user?.id) return;
    
    if (cv.visibility !== 'public') {
      Modal.confirm({
        title: 'CV chưa công khai',
        content: 'Chỉ có thể chia sẻ CV công khai. Bạn có muốn chuyển CV này thành công khai không?',
        okText: 'Chuyển thành công khai',
        cancelText: 'Hủy',
        onOk: async () => {
          try {
            await cvApi.updatePrivacy(cv.id!, user.id, 'public');
            message.success('Đã chuyển CV thành công khai!');
            loadCVs();
            // Sau khi chuyển thành công khai, tạo share link
            setTimeout(() => handleShare({ ...cv, visibility: 'public' }), 1000);
          } catch (error: any) {
            console.error('Error updating CV visibility:', error);
            message.error('Không thể chuyển CV thành công khai');
          }
        }
      });
      return;
    }
    
    try {
      console.log('Generating share link for CV:', cv.id);
      const result = await cvApi.generateShareLink(cv.id!, user.id);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(result.fullUrl);
      
      notification.success({
        message: 'Link chia sẻ đã được tạo!',
        description: (
          <div>
            <p>Link đã được copy vào clipboard:</p>
            <Input.TextArea 
              value={result.fullUrl} 
              readOnly 
              autoSize={{ minRows: 2, maxRows: 3 }}
              style={{ marginTop: 8 }}
            />
          </div>
        ),
        duration: 10,
      });
      
    } catch (error: any) {
      console.error('Error generating share link:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể tạo link chia sẻ';
      message.error(errorMessage);
    }
  };

  const handleEdit = (cv: CV) => {
    console.log('Editing CV:', cv);
    setEditingCV(cv);
    form.setFieldsValue({
      title: cv.title,
      visibility: cv.visibility,
    });
    setIsModalOpen(true);
  };

  const handleView = async (cv: CV) => {
    if (!user?.id) return;
    
    try {
      if (cv.visibility === 'private') {
        // Tạo token cho CV riêng tư để chống copy link
        console.log('Generating access token for private CV:', cv.id);
        const tokenResult = await cvApi.generateAccessToken(cv.id!, user.id);
        const url = uploadApi.getSecureViewUrl(cv.fileUrl, user.id, true, tokenResult.token);
        window.open(url, '_blank');
      } else {
        // Sử dụng secure URL thông thường cho CV khác
        const url = uploadApi.getSecureViewUrl(cv.fileUrl, user.id, true);
        window.open(url, '_blank');
      }
    } catch (error: any) {
      console.error('Error viewing CV:', error);
      message.error('Không thể xem CV: ' + (error.response?.data?.error || error.message));
    }
  };

  const openAddModal = () => {
    setEditingCV(null);
    form.resetFields();
    form.setFieldsValue({ visibility: 'private' });
    setIsModalOpen(true);
  };

  const getFileIcon = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return <FilePdfOutlined style={{ fontSize: 20, color: '#ef4444' }} />;
    } else if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileWordOutlined style={{ fontSize: 20, color: '#16a34a' }} />;
    }
    return <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const columns: ColumnsType<CV> = [
    {
      title: 'Tên CV',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {getFileIcon(record.fileName)}
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.fileName}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Kích thước',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
      render: (size) => formatFileSize(size),
    },
    {
      title: 'Quyền riêng tư',
      dataIndex: 'visibility',
      key: 'visibility',
      width: 150,
      render: (visibility) => {
        const config = {
          private: { color: 'default', text: 'Riêng tư', description: 'Chỉ bạn xem được' },
          public: { color: 'green', text: 'Công khai', description: 'Mọi người xem được và có thể chia sẻ' },
          application_only: { color: 'blue', text: 'Chỉ ứng tuyển', description: 'HR xem khi bạn ứng tuyển, không thể chia sẻ' },
        };
        const { color, text, description } = config[visibility as keyof typeof config] || config.private;
        return (
          <Tooltip title={description}>
            <Tag color={color}>{text}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Mặc định',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      align: 'center',
      render: (isDefault, record) => (
        <Tooltip title={isDefault ? 'CV mặc định' : 'Đặt làm mặc định'}>
          <Button
            type="text"
            icon={isDefault ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={() => !isDefault && handleSetDefault(record)}
            disabled={isDefault}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem CV">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title={record.visibility === 'public' ? 'Chia sẻ CV' : 'Chỉ CV công khai mới có thể chia sẻ'}>
            <Button 
              type="text" 
              icon={<ShareAltOutlined />} 
              onClick={() => handleShare(record)}
              style={{ 
                color: record.visibility === 'public' ? '#1890ff' : '#d9d9d9' 
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa CV này?"
            description="Bạn có chắc chắn muốn xóa CV này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý CV"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
          Thêm CV mới
        </Button>
      }
    >


      <Table
        columns={columns}
        dataSource={cvs}
        rowKey={(record) => `cv-${record.id}-${record.createdAt}`}
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Chưa có CV nào' }}
      />

      <Modal
        title={editingCV ? 'Chỉnh sửa CV' : 'Thêm CV mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingCV(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên CV"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tên CV' }]}
          >
            <Input placeholder="VD: CV Fullstack Developer 2024" size="large" />
          </Form.Item>

          {!editingCV && (
            <>
              <Form.Item label="Upload CV" required>
                <Upload
                  accept=".pdf,.doc,.docx"
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  disabled={uploading}
                >
                  <Button icon={<UploadOutlined />} loading={uploading} size="large" block>
                    {uploading ? 'Đang upload...' : 'Chọn file CV'}
                  </Button>
                </Upload>
                <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                  Hỗ trợ PDF, DOC, DOCX • Tối đa 10MB
                </div>
              </Form.Item>

              <Form.Item name="cvId" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="fileUrl" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="fileName" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="fileSize" hidden>
                <Input />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Quyền riêng tư"
            name="visibility"
            initialValue="private"
          >
            <Select 
              size="large"
              options={[
                { value: 'private', label: '🔒 Riêng tư - Chỉ mình tôi xem được' },
                { value: 'application_only', label: '📋 Chỉ ứng tuyển - HR xem khi tôi ứng tuyển (không thể chia sẻ)' },
                { value: 'public', label: '🌐 Công khai - Mọi người có thể xem và chia sẻ' }
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
                setEditingCV(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCV ? 'Cập nhật' : 'Thêm CV'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
