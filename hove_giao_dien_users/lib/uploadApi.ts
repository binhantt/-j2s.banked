import { api } from './api';

export interface UploadResponse {
  id: number;
  url: string;
  filename: string;
  size: number;
  title: string;
}

export const uploadApi = {
  // Upload CV file - TỰ ĐỘNG lưu vào database
  uploadCV: async (file: File, userId: number, title?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    if (title) {
      formData.append('title', title);
    }

    console.log('=== Uploading CV ===');
    console.log('File:', file.name, file.type, file.size);
    console.log('UserId:', userId);
    console.log('Title:', title);

    const response = await api.post('/api/upload/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // This will be removed by interceptor
      },
      timeout: 30000, // 30 seconds for file upload
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  },

  // Delete CV file
  deleteCV: async (filename: string): Promise<void> => {
    await api.delete('/api/upload/cv', {
      params: { filename },
    });
  },

  // Get full URL for uploaded file
  getFileUrl: (path: string): string => {
    if (path.startsWith('http')) {
      return path;
    }
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${path}`;
  },
  
  // Get view URL for CV
  getViewUrl: (fileUrl: string): string => {
    // Extract filename from fileUrl (/uploads/cv/filename.pdf)
    const filename = fileUrl.split('/').pop();
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/cv/view/${filename}`;
  },
};
