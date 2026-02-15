import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, message, Card } from 'antd';
import { useRouter } from 'next/router';
import { jobApi } from '@/lib/jobApi';
import { useAuthStore } from '@/store/useAuthStore';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

export default function PostJobPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [jobId, setJobId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (router.query.id) {
      setEditMode(true);
      setJobId(Number(router.query.id));
      loadJob(Number(router.query.id));
    }
  }, [router.query.id]);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  const loadJob = async (id: number) => {
    try {
      const job = await jobApi.getJob(id);
      form.setFieldsValue({
        ...job,
        deadline: job.deadline ? dayjs(job.deadline) : null,
      });
    } catch (error) {
      message.error('Không thể tải thông tin bài đăng');
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const jobData = {
        ...values,
        userId: user?.id,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
      };

      if (editMode && jobId) {
        await jobApi.updateJob(jobId, jobData);
        message.success('Cập nhật bài đăng thành công!');
      } else {
        await jobApi.createJob(jobData);
        message.success('Đăng tin tuyển dụng thành công!');
      }
      
      router.push('/profile');
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <Card title={editMode ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            jobType: 'full-time',
            level: 'junior',
            status: 'active',
            interviewRounds: 1,
          }}
        >
          <Form.Item
            label="Tiêu đề công việc"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Senior Frontend Developer" size="large" />
          </Form.Item>

          <Form.Item
            label="Địa điểm"
            name="location"
            rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
          >
            <Input placeholder="VD: Hà Nội, Hồ Chí Minh" size="large" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label="Mức lương tối thiểu"
              name="salaryMin"
            >
              <Input placeholder="VD: 15000000" size="large" />
            </Form.Item>

            <Form.Item
              label="Mức lương tối đa"
              name="salaryMax"
            >
              <Input placeholder="VD: 25000000" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            label="Số lượng tuyển"
            name="maxApplicants"
            tooltip="Để trống nếu không giới hạn số lượng. Tin sẽ tự động đóng khi đủ số người ứng tuyển."
          >
            <InputNumber 
              placeholder="VD: 5" 
              size="large" 
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Số vòng phỏng vấn"
            name="interviewRounds"
            tooltip="Số vòng phỏng vấn mà ứng viên cần vượt qua"
            initialValue={1}
          >
            <InputNumber 
              placeholder="VD: 3" 
              size="large" 
              min={1}
              max={10}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              label="Loại hình công việc"
              name="jobType"
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Option value="full-time">Full-time</Option>
                <Option value="part-time">Part-time</Option>
                <Option value="contract">Contract</Option>
                <Option value="internship">Internship</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Cấp bậc"
              name="level"
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Option value="intern">Intern</Option>
                <Option value="junior">Junior</Option>
                <Option value="middle">Middle</Option>
                <Option value="senior">Senior</Option>
                <Option value="lead">Lead</Option>
                <Option value="manager">Manager</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Kinh nghiệm"
              name="experience"
            >
              <Input placeholder="VD: 2-3 năm" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            label="Mô tả công việc"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
            />
          </Form.Item>

          <Form.Item
            label="Yêu cầu ứng viên"
            name="requirements"
            rules={[{ required: true, message: 'Vui lòng nhập yêu cầu' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
            />
          </Form.Item>

          <Form.Item
            label="Quyền lợi"
            name="benefits"
          >
            <TextArea 
              rows={4} 
              placeholder="Các quyền lợi, phúc lợi cho ứng viên..."
            />
          </Form.Item>

          <Form.Item
            label="Hạn nộp hồ sơ"
            name="deadline"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              size="large"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
              >
                {editMode ? 'Cập nhật' : 'Đăng tin'}
              </Button>
              <Button 
                size="large"
                onClick={() => router.push('/profile')}
              >
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
