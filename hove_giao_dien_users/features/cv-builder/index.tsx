import { useEffect, useState } from 'react';
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

type CVDraftValues = Record<string, any>;

const DRAFT_STORAGE_KEY = 'cv-builder-draft-v1';

const formatDateValue = (value: any): string => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value?.format === 'function') {
    return value.format('MM/YYYY');
  }

  return String(value);
};

const formatPeriodValue = (value: any): string => {
  if (!Array.isArray(value) || value.length < 2) {
    return '';
  }

  const start = formatDateValue(value[0]);
  const end = formatDateValue(value[1]);

  if (!start && !end) {
    return '';
  }

  return `${start || '...'} - ${end || '...'}`;
};

const getIndexedCount = (values: CVDraftValues, prefix: string): number => {
  let maxIndex = -1;
  const pattern = new RegExp(`^${prefix}_[^_]+_(\\d+)$`);

  Object.keys(values).forEach((key) => {
    const match = key.match(pattern);
    if (match) {
      maxIndex = Math.max(maxIndex, Number(match[1]));
    }
  });

  return maxIndex + 1;
};

const buildItems = <T,>(count: number, factory: () => T): T[] => {
  return Array.from({ length: count }, () => factory());
};

const extractIndexedItems = (values: CVDraftValues, prefix: string, fieldNames: string[]) => {
  const indices = new Set<number>();
  const pattern = new RegExp(`^${prefix}_[^_]+_(\\d+)$`);

  Object.keys(values).forEach((key) => {
    const match = key.match(pattern);
    if (match) {
      indices.add(Number(match[1]));
    }
  });

  return Array.from(indices)
    .sort((left, right) => left - right)
    .map((index) => {
      const item: Record<string, any> = { index };
      let hasValue = false;

      fieldNames.forEach((fieldName) => {
        const value = values[`${prefix}_${fieldName}_${index}`];
        item[fieldName] = value;
        if (value !== undefined && value !== null && value !== '') {
          hasValue = true;
        }
      });

      return hasValue ? item : null;
    })
    .filter(Boolean) as Array<Record<string, any>>;
};

export const CVBuilderFeature = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<CVDraftValues | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!rawDraft) {
      return;
    }

    try {
      const savedDraft = JSON.parse(rawDraft) as CVDraftValues;
      form.setFieldsValue(savedDraft);

      setExperiences(buildItems(getIndexedCount(savedDraft, 'exp'), () => ({
        title: '',
        company: '',
        period: [null, null],
        description: ''
      })));

      setEducations(buildItems(getIndexedCount(savedDraft, 'edu'), () => ({
        degree: '',
        school: '',
        period: [null, null],
        gpa: ''
      })));

      setSkills(buildItems(getIndexedCount(savedDraft, 'skill'), () => ({
        name: '',
        level: 3
      })));

      message.info('Đã khôi phục bản nháp CV gần nhất');
    } catch (error) {
      console.warn('Failed to restore CV draft:', error);
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [form]);

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
      const draft = {
        ...values,
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      }

      setPreviewData(draft);
      message.success('Đã lưu bản nháp CV');
    } catch (error) {
      message.error('Không thể lưu bản nháp CV');
    }
  };

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setPreviewData(values);
      setPreviewMode(true);
    } catch {
      message.error('Vui lòng kiểm tra lại các trường bắt buộc');
    }
  };

  const handleExport = () => {
    message.info('Tính năng xuất PDF đang được phát triển...');
  };

  if (previewMode) {
    return <CVPreview data={previewData ?? form.getFieldsValue(true)} onBack={() => setPreviewMode(false)} />;
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
            <Button icon={<EyeOutlined />} size="large" onClick={handlePreview}>
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
  const values = data ?? {};

  const fullName = values.fullName || 'Nguyễn Văn A';
  const position = values.position || 'Frontend Developer';
  const email = values.email || 'email@example.com';
  const phone = values.phone || '0123456789';
  const address = values.address || 'Hà Nội, Việt Nam';
  const objective = values.objective || 'Tìm kiếm một môi trường làm việc phù hợp để phát triển năng lực chuyên môn.';

  const experiences = extractIndexedItems(values, 'exp', ['title', 'company', 'period', 'desc']);
  const educations = extractIndexedItems(values, 'edu', ['degree', 'school', 'period', 'gpa']);
  const skills = extractIndexedItems(values, 'skill', ['name', 'level']);

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
            <div className="text-center mb-8 border-b-2 border-green-600 pb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{fullName}</h1>
              <h2 className="text-xl text-green-600 font-semibold mb-4">{position}</h2>
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                <span>📧 {email}</span>
                <span>📱 {phone}</span>
                <span>📍 {address}</span>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">
                  MỤC TIÊU NGHỀ NGHIỆP
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {objective}
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">
                  KINH NGHIỆM LÀM VIỆC
                </h3>
                <div className="space-y-4">
                  {experiences.length > 0 ? experiences.map((experience) => (
                    <div key={experience.index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{experience.title || 'Chưa có vị trí'}</h4>
                          <p className="text-green-600">{experience.company || 'Chưa có công ty'}</p>
                        </div>
                        <span className="text-gray-600 text-sm">{formatPeriodValue(experience.period) || 'Chưa cập nhật'}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-line">
                        {experience.desc || 'Chưa có mô tả công việc'}
                      </p>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm">Chưa có kinh nghiệm được nhập.</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">
                  HỌC VẤN
                </h3>
                <div className="space-y-4">
                  {educations.length > 0 ? educations.map((education) => (
                    <div key={education.index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{education.degree || 'Chưa có bằng cấp'}</h4>
                          <p className="text-green-600">{education.school || 'Chưa có trường'}</p>
                        </div>
                        <span className="text-gray-600 text-sm">{formatPeriodValue(education.period) || 'Chưa cập nhật'}</span>
                      </div>
                      <p className="text-gray-700 text-sm">GPA: {education.gpa || 'Chưa có thông tin'}</p>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm">Chưa có học vấn được nhập.</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">
                  KỸ NĂNG
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.length > 0 ? skills.map((skill) => (
                    <div key={skill.index} className="flex items-center gap-2">
                      <span className="font-medium">{skill.name || 'Chưa đặt tên'}:</span>
                      <Rate disabled defaultValue={Number(skill.level) || 0} className="text-sm" />
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm">Chưa có kỹ năng được nhập.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
