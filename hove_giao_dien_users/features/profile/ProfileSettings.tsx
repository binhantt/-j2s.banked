import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    currentPosition: '',
    location: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        currentPosition: (user as any).currentPosition || '',
        location: (user as any).location || '',
        phone: (user as any).phone || '',
        bio: (user as any).bio || '',
      });
    }
  }, [user]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.put(`/api/users/${user.id}`, formData);
      setUser(response.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thông tin cá nhân
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Cập nhật thông tin thành công!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vị trí hiện tại"
                value={formData.currentPosition}
                onChange={handleChange('currentPosition')}
                placeholder="VD: Senior Frontend Developer"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Địa điểm"
                value={formData.location}
                onChange={handleChange('location')}
                placeholder="VD: TP. Hồ Chí Minh"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="VD: 0123456789"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Giới thiệu bản thân"
                value={formData.bio}
                onChange={handleChange('bio')}
                placeholder="Giới thiệu ngắn gọn về bản thân, kinh nghiệm làm việc..."
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
