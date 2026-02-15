import { useState, useEffect } from 'react';
import { Upload, Button, Input, message, Select, Space, Flex } from 'antd';
import { UploadOutlined, FilePdfOutlined, DeleteOutlined } from '@ant-design/icons';
import { uploadApi } from '@/lib/uploadApi';
import { cvApi, CV } from '@/lib/cvApi';
import { useAuthStore } from '@/store/useAuthStore';

interface CVUploadProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const CVUpload = ({ value, onChange }: CVUploadProps) => {
  const [uploadedCV, setUploadedCV] = useState<{ url: string; filename: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');
  const [savedCVs, setSavedCVs] = useState<CV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [mode, setMode] = useState<'saved' | 'upload' | 'manual'>('saved');
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadSavedCVs();
    }
  }, [isAuthenticated, user]);

  const loadSavedCVs = async () => {
    if (!user?.id) return;
    
    try {
      const cvs = await cvApi.getUserCVs(user.id);
      setSavedCVs(cvs);
      
      // Auto-select default CV
      const defaultCV = cvs.find(cv => cv.isDefault);
      if (defaultCV && !value) {
        setSelectedCVId(defaultCV.id!);
        const fullUrl = uploadApi.getFileUrl(defaultCV.fileUrl);
        onChange?.(fullUrl);
      }
    } catch (error) {
      console.error('Load CVs error:', error);
    }
  };

  const handleUpload = async (file: File) => {
    console.log('=== handleUpload called ===');
    console.log('File:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    console.log('User ID:', user?.id);

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
      console.log('Starting upload...');
      // Upload và TỰ ĐỘNG lưu vào database với title là tên file (không có extension)
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const result = await uploadApi.uploadCV(file, user.id, fileNameWithoutExt);
      console.log('Upload result:', result);
      
      const fullUrl = uploadApi.getFileUrl(result.url);
      setUploadedCV({ url: result.url, filename: result.filename });
      setManualUrl('');
      setSelectedCVId(result.id);
      onChange?.(fullUrl);
      
      // Reload danh sách CV
      await loadSavedCVs();
      
      message.success('Upload CV thành công và đã lưu vào danh sách!');
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      message.error(error.response?.data?.error || error.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleRemove = () => {
    setUploadedCV(null);
    setManualUrl('');
    setSelectedCVId(null);
    onChange?.('');
  };

  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setManualUrl(url);
    setSelectedCVId(null);
    setUploadedCV(null);
    onChange?.(url);
  };

  const handleSelectSavedCV = (cvId: number) => {
    const cv = savedCVs.find(c => c.id === cvId);
    if (cv) {
      setSelectedCVId(cvId);
      const fullUrl = uploadApi.getFileUrl(cv.fileUrl);
      onChange?.(fullUrl);
      setUploadedCV(null);
      setManualUrl('');
    }
  };

  return (
    <div>
      {/* Mode selector */}
      {isAuthenticated && savedCVs.length > 0 && (
        <Flex gap={8} style={{ marginBottom: 16 }}>
          <Button
            type={mode === 'saved' ? 'primary' : 'default'}
            onClick={() => setMode('saved')}
            style={{ flex: 1 }}
          >
            Chọn CV đã lưu
          </Button>
          <Button
            type={mode === 'upload' ? 'primary' : 'default'}
            onClick={() => setMode('upload')}
            style={{ flex: 1 }}
          >
            Upload mới
          </Button>
          <Button
            type={mode === 'manual' ? 'primary' : 'default'}
            onClick={() => setMode('manual')}
            style={{ flex: 1 }}
          >
            Nhập link
          </Button>
        </Flex>
      )}

      {/* Saved CVs selector */}
      {mode === 'saved' && savedCVs.length > 0 && (
        <Select
          size="large"
          style={{ width: '100%' }}
          placeholder="Chọn CV từ danh sách đã lưu"
          value={selectedCVId}
          onChange={handleSelectSavedCV}
          options={savedCVs.map(cv => ({
            label: (
              <div>
                <div style={{ fontWeight: 500 }}>{cv.title}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{cv.fileName}</div>
              </div>
            ),
            value: cv.id!,
          }))}
        />
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <>
          {!uploadedCV ? (
            <Upload accept=".pdf" beforeUpload={handleUpload} showUploadList={false} disabled={uploading}>
              <Button icon={<UploadOutlined />} loading={uploading} size="large" block>
                {uploading ? 'Đang upload...' : 'Upload CV (PDF)'}
              </Button>
            </Upload>
          ) : (
            <div
              style={{
                padding: 16,
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                <div>
                  <div style={{ fontWeight: 500 }}>{uploadedCV.filename}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>CV đã upload</div>
                </div>
              </div>
              <Button type="text" danger icon={<DeleteOutlined />} onClick={handleRemove}>
                Xóa
              </Button>
            </div>
          )}
        </>
      )}

      {/* Manual URL mode */}
      {mode === 'manual' && (
        <Input
          placeholder="Nhập link CV (Google Drive, Dropbox...)"
          size="large"
          value={manualUrl}
          onChange={handleManualUrlChange}
        />
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
        {mode === 'upload' && 'Chấp nhận file PDF, tối đa 10MB'}
        {mode === 'manual' && 'Nhập link CV từ Google Drive, Dropbox hoặc dịch vụ lưu trữ khác'}
        {mode === 'saved' && savedCVs.length > 0 && `Bạn có ${savedCVs.length} CV đã lưu`}
      </div>
    </div>
  );
};
