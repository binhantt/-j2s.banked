import { useState } from 'react';
import { Upload, message, Button, Image, Space, Card } from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { uploadApi } from '@/lib/uploadApi';

interface CertificateUploadProps {
  userId: number;
  currentImages?: string;
  onImagesChange: (images: string) => void;
}

export default function CertificateUpload({ userId, currentImages, onImagesChange }: CertificateUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageList, setImageList] = useState<string[]>(
    currentImages ? currentImages.split(',').filter(Boolean) : []
  );

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadApi.uploadImage(file);
      const newList = [...imageList, url];
      setImageList(newList);
      onImagesChange(newList.join(','));
      message.success('Tải ảnh chứng chỉ thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Tải ảnh thất bại!');
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload
  };

  const handleRemove = (url: string) => {
    const newList = imageList.filter(img => img !== url);
    setImageList(newList);
    onImagesChange(newList.join(','));
    message.success('Đã xóa ảnh');
  };

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {imageList.map((url, index) => (
            <Card
              key={index}
              style={{ width: 200 }}
              cover={
                <Image
                  src={url}
                  alt={`Chứng chỉ ${index + 1}`}
                  style={{ height: 150, objectFit: 'cover' }}
                />
              }
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(url)}
                >
                  Xóa
                </Button>
              ]}
            >
              <Card.Meta description={`Chứng chỉ ${index + 1}`} />
            </Card>
          ))}
        </div>

        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept="image/*"
          multiple
        >
          <Button
            icon={<PlusOutlined />}
            loading={uploading}
            type="dashed"
            block
          >
            {uploading ? 'Đang tải lên...' : 'Thêm ảnh chứng chỉ/bằng cấp'}
          </Button>
        </Upload>

        <div style={{
          padding: 12,
          background: '#f0f5ff',
          borderRadius: 8,
          border: '1px solid #adc6ff'
        }}>
          <div style={{ fontSize: 13, color: '#1890ff', marginBottom: 4 }}>
            📌 Lưu ý:
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#595959' }}>
            <li>Tải lên ảnh bằng cấp, chứng chỉ liên quan đến công việc</li>
            <li>Bắt buộc phải có ít nhất 1 ảnh để ứng tuyển dự án</li>
            <li>Định dạng: JPG, PNG (tối đa 5MB/ảnh)</li>
          </ul>
        </div>
      </Space>
    </div>
  );
}
