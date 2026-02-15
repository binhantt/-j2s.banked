import { useState, useEffect } from 'react';
import { Card, Button, List, Modal, Form, Input, Upload, message, Popconfirm, Tag, Space, Select } from 'antd';
import {
  UploadOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  EditOutlined,
  StarOutlined,
  StarFilled,
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  ShareAltOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { cvApi, CV } from '@/lib/cvApi';
import { uploadApi } from '@/lib/uploadApi';
import { useAuthStore } from '@/store/useAuthStore';

export const CVManagement = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCV, setEditingCV] = useState<CV | null>(null);
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
      const data = await cvApi.getUserCVs(user.id);
      setCvs(data);
    } catch (error) {
      console.error('Load CVs error:', error);
      message.error('Không thể tải danh sách CV');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      message.error('Chỉ chấp nhận file PDF');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 10MB');
      return false;
    }

    if (!user?.id) {
      message.error('Vui lòng đăng nhập');
      return false;
    }

    setUploading(true);
    try {
      // Get title from form or use filename without extension
      const titleFromForm = form.getFieldValue('title');
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const cvTitle = titleFromForm || fileNameWithoutExt;
      
      // Upload và TỰ ĐỘNG lưu vào database
      const result = await uploadApi.uploadCV(file, user.id, cvTitle);
      
      message.success('Upload CV thành công! CV đã được lưu vào danh sách.');
      
      // Close modal and reload list
      setModalOpen(false);
      form.resetFields();
      loadCVs();
    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.error || 'Upload thất bại');
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleSubmit = async (values: any) => {
    if (!user?.id) return;

    try {
      if (editingCV) {
        // Update title only
        await cvApi.updateCV(editingCV.id!, { title: values.title });
        
        // Update visibility separately using dedicated endpoint
        if (values.visibility && values.visibility !== editingCV.visibility) {
          await cvApi.updatePrivacy(editingCV.id!, user.id, values.visibility);
        }
        
        message.success('Cập nhật CV thành công');
      } else {
        await cvApi.createCV({
          ...values,
          userId: user.id,
          isDefault: cvs.length === 0, // First CV is default
        });
        message.success('Thêm CV thành công');
      }
      
      setModalOpen(false);
      setEditingCV(null);
      form.resetFields();
      loadCVs();
    } catch (error: any) {
      console.error('Save CV error:', error);
      const errorMsg = error.response?.data?.error || 'Có lỗi xảy ra';
      message.error(errorMsg);
    }
  };

  const handleSetDefault = async (cv: CV) => {
    if (!user?.id) return;

    try {
      await cvApi.setAsDefault(cv.id!, user.id);
      message.success('Đã đặt làm CV mặc định');
      loadCVs();
    } catch (error) {
      console.error('Set default error:', error);
      message.error('Không thể đặt làm mặc định');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await cvApi.deleteCV(id);
      message.success('Đã xóa CV');
      loadCVs();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Không thể xóa CV');
    }
  };

  const handleEdit = (cv: CV) => {
    setEditingCV(cv);
    form.setFieldsValue({
      title: cv.title,
      visibility: cv.visibility || 'application_only',
      fileUrl: cv.fileUrl,
      fileName: cv.fileName,
      fileSize: cv.fileSize,
    });
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCV(null);
    form.resetFields();
    setModalOpen(true);
  };
  
  const handleViewCV = async (cv: CV) => {
    if (!user?.id) return;
    
    try {
      // Generate secure token
      const { token } = await cvApi.generateViewToken(cv.id!, user.id);
      
      // Open CV with token - call backend directly
      const viewUrl = `http://localhost:8080/api/cv/view/${token}`;
      window.open(viewUrl, '_blank');
    } catch (error: any) {
      console.error('Generate token error:', error);
      message.error(error.response?.data?.error || 'Không thể xem CV');
    }
  };
  
  const handleShareCV = (cv: CV) => {
    if (cv.visibility !== 'public') {
      message.warning('Chỉ CV công khai mới có thể chia sẻ!');
      return;
    }
    
    const shareUrl = uploadApi.getFileUrl(cv.fileUrl);
    
    Modal.info({
      title: 'Chia sẻ CV',
      width: 600,
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>Link chia sẻ công khai (ai cũng có thể xem):</p>
          <Input.TextArea
            value={shareUrl}
            readOnly
            rows={3}
            style={{ marginBottom: 12 }}
          />
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              message.success('Đã copy link!');
            }}
            block
          >
            Copy link
          </Button>
        </div>
      ),
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getVisibilityIcon = (visibility?: string) => {
    switch (visibility) {
      case 'public':
        return <EyeOutlined style={{ color: '#52c41a' }} />;
      case 'private':
        return <LockOutlined style={{ color: '#ff4d4f' }} />;
      case 'application_only':
      default:
        return <EyeInvisibleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getVisibilityText = (visibility?: string) => {
    switch (visibility) {
      case 'public':
        return 'Công khai';
      case 'private':
        return 'Riêng tư';
      case 'application_only':
      default:
        return 'Chỉ khi ứng tuyển';
    }
  };

  return (
    <Card
      title="Quản lý CV"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
          Thêm CV mới
        </Button>
      }
    >
      <List
        loading={loading}
        dataSource={cvs}
        locale={{ emptyText: 'Chưa có CV nào. Hãy thêm CV đầu tiên!' }}
        renderItem={(cv) => (
          <List.Item
            actions={[
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewCV(cv)}
              >
                Xem
              </Button>,
              cv.visibility === 'public' && (
                <Button
                  type="text"
                  icon={<ShareAltOutlined />}
                  onClick={() => handleShareCV(cv)}
                  style={{ color: '#52c41a' }}
                >
                  Chia sẻ
                </Button>
              ),
              <Button
                type="text"
                icon={cv.isDefault ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                onClick={() => handleSetDefault(cv)}
                disabled={cv.isDefault}
              >
                {cv.isDefault ? 'Mặc định' : 'Đặt mặc định'}
              </Button>,
              <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(cv)}>
                Sửa
              </Button>,
              <Popconfirm
                title="Xóa CV"
                description="Bạn có chắc muốn xóa CV này?"
                onConfirm={() => handleDelete(cv.id!)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>,
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={<FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />}
              title={
                <Space>
                  <span>{cv.title}</span>
                  {cv.isDefault && <Tag color="gold">Mặc định</Tag>}
                  <Tag icon={getVisibilityIcon(cv.visibility)} color={
                    cv.visibility === 'public' ? 'green' : 
                    cv.visibility === 'private' ? 'red' : 'orange'
                  }>
                    {getVisibilityText(cv.visibility)}
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <div style={{ color: '#666', fontSize: 13 }}>{cv.fileName}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>
                    {formatFileSize(cv.fileSize)} • Tạo lúc{' '}
                    {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString('vi-VN') : ''}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title={editingCV ? 'Chỉnh sửa CV' : 'Thêm CV mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingCV(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {editingCV ? (
            // Edit mode - only allow changing title
            <>
              <Form.Item
                label="Tên CV"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tên CV' }]}
              >
                <Input placeholder="VD: CV Software Engineer, CV Marketing..." size="large" />
              </Form.Item>
              
              <Form.Item
                label="Quyền riêng tư"
                name="visibility"
                initialValue="application_only"
                rules={[{ required: true, message: 'Vui lòng chọn quyền riêng tư' }]}
              >
                <Select size="large">
                  <Select.Option value="private">
                    <Space>
                      <LockOutlined style={{ color: '#ff4d4f' }} />
                      <span>Riêng tư - Chỉ mình tôi xem được</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="application_only">
                    <Space>
                      <EyeInvisibleOutlined style={{ color: '#faad14' }} />
                      <span>Chỉ khi ứng tuyển - HR chỉ xem khi tôi apply job</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="public">
                    <Space>
                      <EyeOutlined style={{ color: '#52c41a' }} />
                      <span>Công khai - Ai cũng có thể xem</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
              
              <div style={{ 
                padding: 12, 
                background: '#f5f5f5', 
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                color: '#666'
              }}>
                <strong>File hiện tại:</strong> {editingCV.fileName}
              </div>
            </>
          ) : (
            // Add new mode - allow title input before upload
            <>
              <Form.Item
                label="Tên CV"
                name="title"
                rules={[{ required: true, message: 'Vui lòng nhập tên CV' }]}
              >
                <Input placeholder="VD: CV Software Engineer, CV Marketing..." size="large" />
              </Form.Item>
              
              <Form.Item
                label="Quyền riêng tư"
                name="visibility"
                initialValue="application_only"
                rules={[{ required: true, message: 'Vui lòng chọn quyền riêng tư' }]}
              >
                <Select size="large">
                  <Select.Option value="private">
                    <Space>
                      <LockOutlined style={{ color: '#ff4d4f' }} />
                      <span>Riêng tư</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="application_only">
                    <Space>
                      <EyeInvisibleOutlined style={{ color: '#faad14' }} />
                      <span>Chỉ khi ứng tuyển</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value="public">
                    <Space>
                      <EyeOutlined style={{ color: '#52c41a' }} />
                      <span>Công khai</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Upload CV" required>
                <Upload accept=".pdf" beforeUpload={handleUpload} showUploadList={false}>
                  <Button icon={<UploadOutlined />} loading={uploading} size="large" block>
                    {uploading ? 'Đang upload...' : 'Chọn file PDF'}
                  </Button>
                </Upload>
                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  Chấp nhận file PDF, tối đa 10MB. Nhập tên CV trước, sau đó chọn file để upload.
                </div>
              </Form.Item>
            </>
          )}

          <Form.Item name="fileUrl" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="fileName" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="fileSize" hidden>
            <Input />
          </Form.Item>

          {editingCV && (
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    setEditingCV(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  Cập nhật
                </Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};
