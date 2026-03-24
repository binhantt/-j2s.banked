import { Card, Upload, Button, message, Image, Popconfirm, Progress, Tag } from 'antd';
import { UploadOutlined, DeleteOutlined, PictureOutlined, TeamOutlined, HomeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { uploadApi } from '@/lib/uploadApi';
import { companyApi } from '@/lib/companyApi';
import { companyImageApi, CompanyImage } from '@/lib/companyImageApi';

export const ImageGalleryManagementSection = () => {
  const { user } = useAuthStore();
  const [images, setImages] = useState<CompanyImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadImages();
    }
  }, [user?.id]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const company = await companyApi.getCompanyByHrId(user!.id);
      if (company?.id) {
        setCompanyId(company.id);
        const data = await companyImageApi.getCompanyImages(company.id);
        setImages(data);
      }
    } catch (error) {
      console.error('Load images error:', error);
      // Fallback to old method if new API fails
      try {
        const company = await companyApi.getCompanyByHrId(user!.id);
        if (company?.images) {
          const oldImages = JSON.parse(company.images);
          const convertedImages: CompanyImage[] = oldImages.map((url: string, index: number) => ({
            id: index,
            companyId: company.id!,
            imageUrl: url,
            type: 'GENERAL' as const,
            displayOrder: index,
            createdAt: new Date().toISOString(),
          }));
          setImages(convertedImages);
        }
      } catch (fallbackError) {
        console.error('Fallback load error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không được vượt quá 5MB');
      return false;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Chỉ được upload file ảnh');
      return false;
    }

    // Check max images limit
    if (images.length >= 20) {
      message.error('Tối đa 20 ảnh');
      return false;
    }

    if (!companyId) {
      message.error('Không tìm thấy thông tin công ty');
      return false;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const imageUrl = await uploadApi.uploadImage(file);
      
      // Try new API first
      try {
        const newImageRequest = {
          companyId,
          imageUrl,
          type: 'GENERAL' as const,
          displayOrder: images.length,
        };
        
        const savedImage = await companyImageApi.addCompanyImage(newImageRequest);
        setImages([...images, savedImage]);
      } catch (apiError) {
        // Fallback to old method
        const newImages = [...images.map(img => img.imageUrl), imageUrl];
        const company = await companyApi.getCompanyByHrId(user!.id);
        if (company) {
          await companyApi.updateCompany(company.id, {
            ...company,
            images: JSON.stringify(newImages),
          } as any);
        }
        
        const newImage: CompanyImage = {
          id: Date.now(),
          companyId,
          imageUrl,
          type: 'GENERAL',
          displayOrder: images.length,
          createdAt: new Date().toISOString(),
        };
        setImages([...images, newImage]);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        message.success('Upload ảnh thành công!');
      }, 500);
      
      return false;
    } catch (error) {
      setUploadProgress(0);
      message.error('Upload ảnh thất bại!');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: CompanyImage) => {
    try {
      // Always try real API first (uses real DB id from addCompanyImage)
      await companyImageApi.deleteCompanyImage(image.id);
    } catch (apiError) {
      // Fallback: if real API fails (e.g. fake id from old data), remove from company's images JSON
      const newImages = images.filter((img) => img.imageUrl !== image.imageUrl);
      const company = await companyApi.getCompanyByHrId(user!.id);
      if (company) {
        await companyApi.updateCompany(company.id, {
          ...company,
          images: JSON.stringify(newImages.map(img => img.imageUrl)),
        } as any);
      }
    }

    setImages(images.filter((img) => img.imageUrl !== image.imageUrl));
    message.success('Đã xóa ảnh!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <PictureOutlined className="text-xl text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Thư viện ảnh công ty</h3>
            <Tag color="blue">{images.length}/20</Tag>
          </div>
          <p className="text-gray-600 mb-4">
            Upload ảnh văn phòng, đội ngũ, hoạt động của công ty để thu hút ứng viên. 
            Ảnh chất lượng cao sẽ tạo ấn tượng tốt với ứng viên.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <HomeOutlined className="text-green-600" />
              <span>Ảnh văn phòng, không gian làm việc</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TeamOutlined className="text-green-500" />
              <span>Ảnh đội ngũ, nhân viên</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PictureOutlined className="text-purple-500" />
              <span>Hoạt động, sự kiện công ty</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Upload 
            beforeUpload={handleUpload} 
            showUploadList={false} 
            accept="image/*" 
            multiple
            disabled={images.length >= 20}
          >
            <Button 
              icon={<UploadOutlined />} 
              loading={uploading} 
              size="large" 
              type="primary"
              disabled={images.length >= 20}
            >
              {uploading ? 'Đang upload...' : 'Upload ảnh mới'}
            </Button>
          </Upload>

          {uploading && uploadProgress > 0 && (
            <div className="w-full max-w-md">
              <Progress 
                percent={uploadProgress} 
                status={uploadProgress === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          )}

          <div className="text-xs text-gray-500">
            • Định dạng: JPG, PNG, GIF • Kích thước tối đa: 5MB • Tối đa 20 ảnh
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="text-center py-12">
          <div className="text-gray-500">
            <PictureOutlined className="text-4xl mb-2" />
            <div>Đang tải thư viện ảnh...</div>
          </div>
        </Card>
      ) : images.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400">
            <PictureOutlined className="text-6xl mb-4" />
            <div className="text-lg font-medium mb-2">Chưa có ảnh nào</div>
            <div className="text-sm">Hãy upload ảnh đầu tiên để giới thiệu công ty của bạn</div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Thư viện ảnh ({images.length} ảnh)
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id || index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <Image 
                    src={image.imageUrl} 
                    alt={`Ảnh công ty ${index + 1}`} 
                    className="w-full h-full object-cover"
                    preview={{
                      mask: <div className="text-white text-xs">Xem ảnh</div>
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Popconfirm
                    title="Xác nhận xóa ảnh này?"
                    description="Ảnh sẽ bị xóa vĩnh viễn và không thể khôi phục"
                    onConfirm={() => handleDelete(image)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button 
                      danger 
                      size="small" 
                      icon={<DeleteOutlined />}
                      className="shadow-lg"
                    />
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
