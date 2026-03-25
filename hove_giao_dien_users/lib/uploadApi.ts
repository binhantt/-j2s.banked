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
  uploadCV: (
    file: File,
    userId: number,
    title?: string,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResponse> => {
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

    return api
      .post('/api/upload/cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      })
      .then((response) => {
        console.log('Upload response:', response.data);
        return response.data;
      });
  },

  // Delete CV file
  deleteCV: async (filename: string): Promise<void> => {
    await api.delete('/api/upload/cv', {
      params: { filename },
    });
  },

  // Upload image (for gallery, avatar, etc.)
  uploadImage: (
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    console.log('=== Uploading Image ===');
    console.log('File:', file.name, file.type, file.size);

    return api
      .post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      })
      .then((response) => {
        console.log('Upload image response:', response.data);
        return response.data.url || response.data;
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
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/cv/${filename}`;
  },
  
  getSecureViewUrl: (fileUrl: string, viewerId: number, embed: boolean = true, token?: string): string => {
    const filename = fileUrl.split('/').pop();
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/cv/${filename}`;
    let url = `${baseUrl}?viewerId=${viewerId}&embed=${embed}`;
    if (token) {
      url += `&token=${token}`;
    }
    const authToken = localStorage.getItem('token');
    if (authToken) {
      url += `&auth_token=${authToken}`;
    }
    return url;
  },
};
