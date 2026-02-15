import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Empty, Space, Tag } from 'antd';
import { HeartFilled, EnvironmentOutlined, DollarOutlined, MessageOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { savedJobApi } from '@/lib/savedJobApi';
import { jobApi } from '@/lib/jobApi';
import { useAuthStore } from '@/store/useAuthStore';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadSavedJobs();
    }
  }, [user?.id]);

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const saved = await savedJobApi.getUserSavedJobs(user.id);
      
      // Load job details for each saved job
      const jobsWithDetails = await Promise.all(
        saved.map(async (s: any) => {
          try {
            const job = await jobApi.getJob(s.jobPostingId);
            return { ...s, job };
          } catch {
            return null;
          }
        })
      );
      
      setSavedJobs(jobsWithDetails.filter(j => j !== null));
    } catch (error) {
      message.error('Không thể tải danh sách việc đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: number) => {
    try {
      await savedJobApi.unsaveJob(user.id, jobId);
      message.success('Đã bỏ lưu công việc');
      loadSavedJobs();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <Card title={`Việc làm đã lưu (${savedJobs.length})`}>
        {savedJobs.length === 0 ? (
          <Empty description="Chưa có việc làm nào được lưu" />
        ) : (
          <Row gutter={[16, 16]}>
            {savedJobs.map((item: any) => (
              <Col xs={24} md={12} key={item.id}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Button
                      type="link"
                      onClick={() => router.push(`/jobs/${item.job.id}`)}
                    >
                      Xem chi tiết
                    </Button>,
                    <Button
                      type="link"
                      danger
                      icon={<HeartFilled />}
                      onClick={() => handleUnsave(item.job.id)}
                    >
                      Bỏ lưu
                    </Button>,
                  ]}
                >
                  <h3 style={{ fontSize: 18, marginBottom: 12 }}>{item.job.title}</h3>
                  
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <EnvironmentOutlined />
                      <span>{item.job.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DollarOutlined />
                      <span>{item.job.salaryMin} - {item.job.salaryMax}</span>
                    </div>
                  </Space>

                  <div style={{ marginTop: 12 }}>
                    <Tag color="blue">{item.job.jobType}</Tag>
                    <Tag color="green">{item.job.level}</Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
}
