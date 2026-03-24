import { Card, Button, List, Modal, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { jobApi } from '@/lib/jobApi';
import { useRouter } from 'next/router';

export const JobPostingManagementSection = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [jobPosts, setJobPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadJobs();
    }
  }, [user?.id]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await jobApi.getJobsByUser(user!.id);
      setJobPosts(data);
    } catch (error) {
      console.error('Load jobs error:', error);
      message.error('Không thể tải danh sách tin tuyển dụng!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa tin tuyển dụng',
      content: 'Bạn có chắc chắn muốn xóa tin này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await jobApi.deleteJob(id);
          await loadJobs();
          message.success('Đã xóa tin tuyển dụng!');
        } catch (error) {
          message.error('Xóa thất bại!');
        }
      },
    });
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await jobApi.toggleStatus(id);
      await loadJobs();
      message.success('Đã cập nhật trạng thái!');
    } catch (error) {
      message.error('Cập nhật thất bại!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{jobPosts.length}</div>
          <div className="text-gray-600 mt-2">Tin đang đăng</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {jobPosts.reduce((sum, job) => sum + (job.applications || 0), 0)}
          </div>
          <div className="text-gray-600 mt-2">Ứng viên</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {jobPosts.reduce((sum, job) => sum + (job.views || 0), 0)}
          </div>
          <div className="text-gray-600 mt-2">Lượt xem</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {jobPosts.filter((job) => job.status === 'active').length}
          </div>
          <div className="text-gray-600 mt-2">Đang hoạt động</div>
        </Card>
      </div>

      {/* Create new job button */}
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        block
        className="h-14 text-lg"
        onClick={() => router.push('/jobs/post')}
      >
        Đăng tin tuyển dụng mới
      </Button>

      {/* Job Posts List */}
      {loading ? (
        <Card className="text-center py-8">
          <div>Đang tải...</div>
        </Card>
      ) : jobPosts.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-gray-500">Chưa có tin tuyển dụng nào</div>
        </Card>
      ) : (
        <List
          dataSource={jobPosts}
          renderItem={(job) => (
            <Card className="mb-4 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <Tag color={job.status === 'active' ? 'green' : 'red'}>
                      {job.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
                    </Tag>
                  </div>
                  <div className="text-gray-600 text-sm space-y-1">
                    <div>📍 {job.location}</div>
                    <div>💰 {job.salary}</div>
                    <div>👥 {job.applications || 0} ứng viên • 👁️ {job.views || 0} lượt xem</div>
                  </div>
                </div>
                <div className="flex gap-2 text-sm">
                  <Button icon={<EyeOutlined />} onClick={() => router.push(`/jobs/${job.id}`)}>
                    Xem
                  </Button>
                  <Button 
                    icon={job.status === 'active' ? <DeleteOutlined /> : <PlusOutlined />} 
                    onClick={() => handleToggleStatus(job.id)}
                  >
                    {job.status === 'active' ? 'Ngừng đăng' : 'Mở đăng lại'}
                  </Button>
                  <Button icon={<EditOutlined />} onClick={() => router.push(`/jobs/edit/${job.id}`)}>
                    Sửa
                  </Button>
                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(job.id)}>
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
};
