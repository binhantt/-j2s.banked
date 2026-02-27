import { useState, useEffect } from 'react';
import { Card, Button, Upload, message, List, Image, Input, Popconfirm, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { companyApi } from '@/lib/companyApi';
import { companyImageApi, CompanyImage } from '@/lib/companyImageApi';
import { uploadApi } from '@/lib/uploadApi';
import type { UploadFile } from 'antd';

export const CompanyImagesManagement = () => {
  const { user } = useAuthStore();
  const [images, setImages] = useState<CompanyImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCompanyAndImages();
    }
  }, [user?.id]);

  const loadCompanyAndImages = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const company = await companyApi.getCompanyByUserId(user.id);
      if (company) {
        setCompanyId(company.id!);
        const imagesList = await companyImageApi.getImagesByCompany(company.id!);
        setImages(imagesList);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!companyId) {
      message.error('Không tìm thấy thông tin công ty');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadApi.uploadImage(file);
      
      const newImage: CompanyImage = {
        companyId,
        imageUrl,
        description: '',
        displayOrder: images.length,
      };

      const saved = await companyImageApi.createImage(newImage);
      setImages([...images, saved]);
      message.success('Upload ảnh thành công!');
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Upload ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await companyImageApi.deleteImage(id);
      setImages(images.filter(img => img.id !== id));
      message.success('Xóa ảnh thành công');
    } catch (error) {
      console.error('Error deleting image:', error);
      message.error('Xóa ảnh thất bại');
    }
  };

  const handleDescriptionChange = async (id: number, description: string) => {
    try {
      const image = images.find(img => img.id === id);
      if (image) {
        const updated = { ...image, description };
        await companyImageApi.createImage(updated);
        setImages(images.map(img => img.id === id ? updated : img));
      }
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý hình ảnh công ty
          </h2>
          <p className="text-gray-600">
            Upload và quản lý hình ảnh giới thiệu về công ty, môi trường làm việc
          </p>
        </div>

        <Upload
          listType="picture-card"
          showUploadList={false}
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
          accept="image/*"
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>

        {uploading && (
          <div className="mt-4">
            <Spin /> Đang upload...
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            Hình ảnh đã upload ({images.length})
          </h3>
          
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={images}
            renderItem={(image) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      <img
                        alt={image.description || 'Company image'}
                        src={image.imageUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Error';
                        }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          gap: 8,
                        }}
                      >
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<EyeOutlined />}
                          onClick={() => {
                            setPreviewImage(image.imageUrl);
                            setPreviewOpen(true);
                          }}
                        />
                        <Popconfirm
                          title="Xóa ảnh này?"
                          onConfirm={() => handleDelete(image.id!)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button
                            danger
                            shape="circle"
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  }
                >
                  <Input
                    placeholder="Mô tả ảnh..."
                    value={image.description}
                    onChange={(e) => handleDescriptionChange(image.id!, e.target.value)}
                    onBlur={(e) => handleDescriptionChange(image.id!, e.target.value)}
                  />
                </Card>
              </List.Item>
            )}
          />
        </div>
      </Card>

      {previewOpen && (
        <Image
          style={{ display: 'none' }}
          src={previewImage}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
          }}
        />
      )}
    </div>
  );
};
