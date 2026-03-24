import { useState, useEffect } from 'react';
import { Upload, Button, Input, message, Select, Card } from 'antd';
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

    if (!user?.id) {
      message.error('Vui lòng đăng nhập');
      return false;
    }

    setUploading(true);
    try {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const result = await uploadApi.uploadCV(file, user.id, fileNameWithoutExt);
      
      const fullUrl = uploadApi.getFileUrl(result.url);
      setUploadedCV({ url: result.url, filename: result.filename });
      setManualUrl('');
      setSelectedCVId(result.id);
      onChange?.(fullUrl);
      
      await loadSavedCVs();
      message.success('Upload CV thành công và đã lưu vào danh sách!');
    } catch (error: any) {
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
      return <FilePdfOutlined style={{ fontSize: 28, color: '#ef4444' }} />;
    } else if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileWordOutlined style={{ fontSize: 28, color: '#16a34a' }} />;
    }
    return <FileTextOutlined style={{ fontSize: 28, color: '#1890ff' }} />;
  };

  return (
    <div style={{ width: '100%' }}>
      {isAuthenticated && savedCVs.length > 0 && (
        <div
          style={{
          display: 'grid', 
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 8,
            padding: 6,
            background: '#f5f7fa',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Button
            type={mode === 'saved' ? 'primary' : 'default'}
            icon={<CheckCircleOutlined />}
            onClick={() => setMode('saved')}
            style={{ height: 40, borderRadius: 8, fontWeight: 500 }}
          >
            CV đã lưu
          </Button>
          <Button
            type={mode === 'upload' ? 'primary' : 'default'}
            icon={<UploadOutlined />}
            onClick={() => setMode('upload')}
            style={{ height: 40, borderRadius: 8, fontWeight: 500 }}
          >
            Upload mới
          </Button>
          <Button
            type={mode === 'manual' ? 'primary' : 'default'}
            icon={<FileTextOutlined />}
            onClick={() => setMode('manual')}
            style={{ height: 40, borderRadius: 8, fontWeight: 500 }}
          >
            Nhập link
          </Button>
        </div>
      )}

      {mode === 'saved' && savedCVs.length > 0 && (
        <Card
          style={{ marginBottom: 12, borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: 'none' }}
          styles={{ body: { padding: 14 } }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#111827' }}>
            Chọn CV từ danh sách đã lưu
          </div>
          <Select
            size="large"
            style={{ width: '100%' }}
            placeholder="Chọn CV đã lưu"
            value={selectedCVId}
            onChange={handleSelectSavedCV}
            options={savedCVs.map(cv => ({
              label: (
                <div style={{ padding: '2px 0' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{cv.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {cv.fileName}{cv.isDefault ? ' • Mặc định' : ''}
                  </div>
                </div>
              ),
              value: cv.id!,
            }))}
          />
        </Card>
      )}

      {mode === 'upload' && (
        <Card
          style={{ marginBottom: 12, borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: 'none' }}
          styles={{ body: { padding: 14 } }}
        >
          {!uploadedCV ? (
            <Upload 
              accept=".pdf,.doc,.docx" 
              beforeUpload={handleUpload} 
              showUploadList={false} 
              disabled={uploading}
            >
              <div
                style={{
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 10,
                  padding: '22px 16px',
                textAlign: 'center',
                  background: '#f8fafc',
                cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                <UploadOutlined style={{ fontSize: 34, color: '#16a34a', marginBottom: 8 }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                  {uploading ? 'Đang upload CV...' : 'Chọn file CV để upload'}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  Hỗ trợ PDF/DOC/DOCX • Tối đa 10MB
                </div>
              </div>
            </Upload>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  {getFileIcon(uploadedCV.filename)}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {uploadedCV.filename}
                    </div>
                  <div style={{ fontSize: 12, color: '#16a34a' }}>Upload thành công</div>
                    </div>
                  </div>
              <Button type="text" danger icon={<DeleteOutlined />} onClick={handleRemove}>
                  Xóa
                </Button>
              </div>
          )}
            </Card>
      )}

      {mode === 'manual' && (
        <Card
          style={{ marginBottom: 12, borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: 'none' }}
          styles={{ body: { padding: 14 } }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#111827' }}>
            Dán link CV của bạn
          </div>
          <Input
            placeholder="https://drive.google.com/..."
            size="large"
            value={manualUrl}
            onChange={handleManualUrlChange}
            style={{ borderRadius: 10 }}
          />
        </Card>
      )}

      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          color: '#6b7280',
          padding: '10px 12px',
          background: '#f9fafb',
          borderRadius: 10,
          border: '1px solid #eceff3',
        }}
      >
        {mode === 'upload' && 'CV upload mới sẽ được lưu tự động vào hồ sơ của bạn.'}
        {mode === 'manual' && 'Bạn có thể dùng link từ Google Drive, Dropbox hoặc OneDrive.'}
        {mode === 'saved' && savedCVs.length > 0 && `Bạn đang có ${savedCVs.length} CV đã lưu.`}
      </div>
    </div>
  );
};
