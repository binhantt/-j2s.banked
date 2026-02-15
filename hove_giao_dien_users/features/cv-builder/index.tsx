import { useState } from 'react';
import { Card, Button, Form, Input, DatePicker, Space, Divider, Select, Rate, message } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Experience {
  title: string;
  company: string;
  period: [any, any];
  description: string;
}

interface Education {
  degree: string;
  school: string;
  period: [any, any];
  gpa: string;
}

interface Skill {
  name: string;
  level: number;
}

export const CVBuilderFeature = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const addExperience = () => {
    setExperiences([...experiences, { title: '', company: '', period: [null, null], description: '' }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducations([...educations, { degree: '', school: '', period: [null, null], gpa: '' }]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 3 }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = async (values: any) => {
    try {
      // TODO: Call API to save CV
      message.success('Lưu CV thành công!');
    } catch (error) {
      message.error('Lưu CV thất bại!');
    }
  };

  const handleExport = () => {
    message.info('Tính năng xuất PDF đang được phát triển...');
  };

  if (previewMode) {
    return <CVPreview data={{ experiences, educations, skills }} onBack={() => setPreviewMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo CV Online</h1>
            <p className="text-gray-600 mt-2">Tạo CV chuyên nghiệp trong vài phút</p>
          </div>
          <div className="flex gap-2">
            <Button icon={<EyeOutlined />} size="large" onClick={() => setPreviewMode(true)}>
              Xem trước
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} size="large" onClick={handleExport}>
              Xuất PDF
            </Button>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSave}>
          {/* Personal Information */}
          <Card title="Thông tin cá nhân" className="mb-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true }]}>
                <Input size="large" placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item label="Vị trí ứng tuyển" name="position" rules={[{ required: true }]}>
                <Input size="large" placeholder="Frontend Developer" />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                <Input size="large" placeholder="email@example.com" />
              </Form.Item>
              <Form.Item label="Số điện thoại" name="phone">
                <Input size="large" placeholder="0123456789" />
              </Form.Item>
              <Form.Item label="Địa chỉ" name="address">
                <Input size="large" placeholder="Hà Nội, Việt Nam" />
              </Form.Item>
              <Form.Item label="LinkedIn" name="linkedin">
                <Input size="large" placeholder="linkedin.com/in/yourprofile" />
              </Form.Item>
            </div>
            <Form.Item label="Mục tiêu nghề nghiệp" name="objective">
              <TextArea rows={4} placeholder="Mô tả ngắn gọn về mục tiêu và định hướng nghề nghiệp của bạn..." />
            </Form.Item>
          </Card>

          {/* Experience */}
          <Card 
            title="Kinh nghiệm làm việc" 
            className="mb-6 shadow-lg"
            extra={
              <Button type="dashed" icon={<PlusOutlined />} onClick={addExperience}>
                Thêm
              </Button>
            }
          >
            {experiences.map((exp, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg relative">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  className="absolute top-2 right-2"
                  onClick={() => removeExperience(index)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Form.Item label="Vị trí" name={`exp_title_${index}`}>
                    <Input placeholder="Senior Developer" />
                  </Form.Item>
                  <Form.Item label="Công ty" name={`exp_company_${index}`}>
                    <Input placeholder="ABC Company" />
                  </Form.Item>
                  <Form.Item label="Thời gian" name={`exp_period_${index}`}>
                    <RangePicker className="w-full" />
                  </Form.Item>
                </div>
                <Form.Item label="Mô tả công việc" name={`exp_desc_${index}`}>
                  <TextArea rows={3} placeholder="Mô tả chi tiết công việc và thành tích..." />
                </Form.Item>
              </div>
            ))}
            {experiences.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Chưa có kinh nghiệm nào. Nhấn "Thêm" để bắt đầu.
              </div>
            )}
          </Card>

          {/* Education */}
          <Card 
            title="Học vấn" 
            className="mb-6 shadow-lg"
            extra={
              <Button type="dashed" icon={<PlusOutlined />} onClick={addEducation}>
                Thêm
              </Button>
            }
          >
            {educations.map((edu, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg relative">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  className="absolute top-2 right-2"
                  onClick={() => removeEducation(index)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Form.Item label="Bằng cấp" name={`edu_degree_${index}`}>
                    <Input placeholder="Cử nhân Công nghệ Thông tin" />
                  </Form.Item>
                  <Form.Item label="Trường" name={`edu_school_${index}`}>
                    <Input placeholder="Đại học ABC" />
                  </Form.Item>
                  <Form.Item label="Thời gian" name={`edu_period_${index}`}>
                    <RangePicker className="w-full" />
                  </Form.Item>
                  <Form.Item label="GPA" name={`edu_gpa_${index}`}>
                    <Input placeholder="3.5/4.0" />
                  </Form.Item>
                </div>
              </div>
            ))}
            {educations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Chưa có học vấn nào. Nhấn "Thêm" để bắt đầu.
              </div>
            )}
          </Card>

          {/* Skills */}
          <Card 
            title="Kỹ năng" 
            className="mb-6 shadow-lg"
            extra={
              <Button type="dashed" icon={<PlusOutlined />} onClick={addSkill}>
                Thêm
              </Button>
            }
          >
            {skills.map((skill, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
                <Form.Item label="Tên kỹ năng" name={`skill_name_${index}`} className="flex-1 mb-0">
                  <Input placeholder="JavaScript, React, Node.js..." />
                </Form.Item>
                <Form.Item label="Trình độ" name={`skill_level_${index}`} className="mb-0">
                  <Rate />
                </Form.Item>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeSkill(index)}
                />
              </div>
            ))}
            {skills.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Chưa có kỹ năng nào. Nhấn "Thêm" để bắt đầu.
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button size="large" onClick={() => router.push('/profile')}>
              Hủy
            </Button>
            <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit">
              Lưu CV
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

const CVPreview = ({ data, onBack }: { data: any; onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Xem trước CV</h1>
          <div className="flex gap-2">
            <Button onClick={onBack}>Quay lại</Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              Tải xuống PDF
            </Button>
          </div>
        </div>

        <Card className="shadow-2xl">
          <div className="bg-white p-8">
            <div className="text-center mb-8 border-b-2 border-indigo-600 pb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">NGUYỄN VĂN A</h1>
              <h2 className="text-xl text-indigo-600 font-semibold mb-4">FRONTEND DEVELOPER</h2>
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                <span>📧 email@example.com</span>
                <span>📱 0123456789</span>
                <span>📍 Hà Nội, Việt Nam</span>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-indigo-600 pl-3">
                  MỤC TIÊU NGHỀ NGHIỆP
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Tìm kiếm vị trí Frontend Developer tại một công ty công nghệ năng động...
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-indigo-600 pl-3">
                  KINH NGHIỆM LÀM VIỆC
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">Senior Developer</h4>
                        <p className="text-indigo-600">ABC Company</p>
                      </div>
                      <span className="text-gray-600 text-sm">2022 - Hiện tại</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      • Phát triển và bảo trì các ứng dụng web sử dụng React và TypeScript
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-indigo-600 pl-3">
                  HỌC VẤN
                </h3>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">Cử nhân Công nghệ Thông tin</h4>
                      <p className="text-indigo-600">Đại học ABC</p>
                    </div>
                    <span className="text-gray-600 text-sm">2018 - 2022</span>
                  </div>
                  <p className="text-gray-700 text-sm">GPA: 3.5/4.0</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-indigo-600 pl-3">
                  KỸ NĂNG
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">JavaScript:</span>
                    <Rate disabled defaultValue={4} className="text-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">React:</span>
                    <Rate disabled defaultValue={5} className="text-sm" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
