import { useState, useEffect } from 'react';
import { Upload, Button, Input, message, Select, Flex, Card } from 'antd';
import { UploadOutlined, FilePdfOutlined, DeleteOutlined, FileWordOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
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

    // Accept PDF, DOC, and DOCX files
    const validTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
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

  const getFileIcon = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return <FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />;
    } else if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileWordOutlined style={{ fontSize: 32, color: '#2b579a' }} />;
    }
    return <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Mode selector */}
      {isAuthenticated && savedCVs.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px', 
          marginBottom: '20px' 
        }}>
          <button
            onClick={() => setMode('saved')}
            style={{
              padding: '12px 16px',
              border: mode === 'saved' ? '2px solid #1890ff' : '2px solid #e8e8e8',
              borderRadius: '10px',
              background: mode === 'saved' ? '#e6f7ff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '14px',
              fontWeight: mode === 'saved' ? 600 : 400,
              color: mode === 'saved' ? '#1890ff' : '#595959',
            }}
          >
            📁 CV đã lưu
          </button>
          <button
            onClick={() => setMode('upload')}
            style={{
              padding: '12px 16px',
              border: mode === 'upload' ? '2px solid #52c41a' : '2px solid #e8e8e8',
              borderRadius: '10px',
              background: mode === 'upload' ? '#f6ffed' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '14px',
              fontWeight: mode === 'upload' ? 600 : 400,
              color: mode === 'upload' ? '#52c41a' : '#595959',
            }}
          >
            ⬆️ Upload mới
          </button>
          <button
            onClick={() => setMode('manual')}
            style={{
              padding: '12px 16px',
              border: mode === 'manual' ? '2px solid #722ed1' : '2px solid #e8e8e8',
              borderRadius: '10px',
              background: mode === 'manual' ? '#f9f0ff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '14px',
              fontWeight: mode === 'manual' ? 600 : 400,
              color: mode === 'manual' ? '#722ed1' : '#595959',
            }}
          >
            🔗 Nhập link
          </button>
        </div>
      )}

      {/* Saved CVs selector */}
      {mode === 'saved' && savedCVs.length > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '12px'
        }}>
          <div style={{ 
            color: 'white', 
            fontSize: '16px', 
            fontWeight: 600, 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircleOutlined /> Chọn CV từ danh sách
          </div>
          <Select
            size="large"
            style={{ width: '100%' }}
            placeholder="Chọn CV đã lưu..."
            value={selectedCVId}
            onChange={handleSelectSavedCV}
            dropdownStyle={{ borderRadius: '10px' }}
            options={savedCVs.map(cv => ({
              label: (
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>{cv.title}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: '2px' }}>
                    {cv.fileName} • {cv.isDefault && '⭐ Mặc định'}
                  </div>
                </div>
              ),
              value: cv.id!,
            }))}
          />
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '12px'
        }}>
          {!uploadedCV ? (
            <Upload 
              accept=".pdf,.doc,.docx" 
              beforeUpload={handleUpload} 
              showUploadList={false} 
              disabled={uploading}
            >
              <div style={{
                background: 'white',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                border: '2px dashed rgba(255,255,255,0.5)',
              }}
              onMouseEnter={(e) => {
                if (!uploading) e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              >
                <UploadOutlined style={{ fontSize: 48, color: '#f5576c', marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: '#262626', marginBottom: 8 }}>
                  {uploading ? 'Đang upload...' : 'Click để chọn file CV'}
                </div>
                <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                  Hỗ trợ: PDF, DOC, DOCX (tối đa 10MB)
                </div>
              </div>
            </Upload>
          ) : (
            <Card
              style={{
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {getFileIcon(uploadedCV.filename)}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#262626' }}>
                      {uploadedCV.filename}
                    </div>
                    <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>
                      ✓ Upload thành công
                    </div>
                  </div>
                </div>
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={handleRemove}
                  style={{ borderRadius: '8px' }}
                >
                  Xóa
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Manual URL mode */}
      {mode === 'manual' && (
        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '12px'
        }}>
          <div style={{ 
            color: '#262626', 
            fontSize: '14px', 
            fontWeight: 600, 
            marginBottom: '12px' 
          }}>
            🔗 Nhập link CV của bạn
          </div>
          <Input
            placeholder="https://drive.google.com/... hoặc https://dropbox.com/..."
            size="large"
            value={manualUrl}
            onChange={handleManualUrlChange}
            style={{ 
              borderRadius: '10px',
              border: '2px solid white',
              fontSize: '14px'
            }}
          />
        </div>
      )}

      {/* Helper text */}
      <div style={{ 
        marginTop: 12, 
        fontSize: 13, 
        color: '#8c8c8c',
        padding: '12px 16px',
        background: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #f0f0f0'
      }}>
        {mode === 'upload' && '💡 File sẽ được lưu tự động vào danh sách CV của bạn'}
        {mode === 'manual' && '💡 Hỗ trợ link từ Google Drive, Dropbox, OneDrive...'}
        {mode === 'saved' && savedCVs.length > 0 && `📊 Bạn có ${savedCVs.length} CV đã lưu`}
      </div>
    </div>
  );
};
