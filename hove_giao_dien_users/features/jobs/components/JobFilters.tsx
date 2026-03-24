import { useEffect, useState } from 'react';
import { Select, Checkbox, Divider } from 'antd';
import { JobFilters as JobFiltersType, jobApiService } from '../api/jobApi';
import { FilterOutlined, DollarOutlined, ExperimentOutlined, ThunderboltOutlined } from '@ant-design/icons';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFilterChange: (filters: Partial<JobFiltersType>) => void;
}

const filterCardStyle = {
  background: '#fff',
  borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.05)',
  padding: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
  marginBottom: 20,
};

const sectionTitleStyle = {
  fontWeight: 700,
  fontSize: 15,
  color: '#0f172a',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

export default function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
  const [experiences, setExperiences] = useState<string[]>([]);

  useEffect(() => {
    jobApiService.getExperiences().then((data) => {
      if (data && data.length > 0) {
        setExperiences(data);
      }
    });
  }, []);

  const experienceOptions = [
    { value: 'all', label: 'Tất cả kinh nghiệm' },
    ...experiences.map((exp) => ({ value: exp, label: exp })),
  ];

  return (
    <aside style={{ position: 'sticky', top: 100 }}>
      <div style={{ ...filterCardStyle, padding: '20px 24px' }}>
        <div style={{ ...sectionTitleStyle, marginBottom: 4 }}>
          <FilterOutlined style={{ color: '#16a34a' }} />
          Bộ lọc nâng cao
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Tối ưu tìm kiếm của bạn</p>
      </div>

      <div style={filterCardStyle}>
        {/* Job Type Filter */}
        <div style={sectionTitleStyle}>
          <ThunderboltOutlined style={{ color: '#16a34a' }} />
          Loại hình công việc
        </div>
        <Checkbox.Group
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          value={filters.jobType}
          onChange={(values) => onFilterChange({ jobType: values as string[] })}
        >
          {[
            { label: 'Toàn thời gian', value: 'full-time' },
            { label: 'Bán thời gian', value: 'part-time' },
            { label: 'Thực tập', value: 'internship' },
            { label: 'Freelance', value: 'contract' },
          ].map((opt) => (
            <Checkbox key={opt.value} value={opt.value} style={{ fontSize: 14, color: '#475569' }}>
              {opt.label}
            </Checkbox>
          ))}
        </Checkbox.Group>

        <Divider style={{ margin: '24px 0' }} />

        {/* Salary Filter */}
        <div style={sectionTitleStyle}>
          <DollarOutlined style={{ color: '#16a34a' }} />
          Mức lương
        </div>
        <Select
          size="large"
          style={{ width: '100%' }}
          placeholder="Tất cả mức lương"
          value={filters.salaryRange}
          onChange={(value) => onFilterChange({ salaryRange: value })}
          options={[
            { value: 'all', label: 'Tất cả mức lương' },
            { value: 'under-10', label: 'Dưới 10 triệu' },
            { value: '10-20', label: '10 - 20 triệu' },
            { value: '20-50', label: '20 - 50 triệu' },
            { value: 'over-50', label: 'Trên 50 triệu' },
          ]}
        />

        <Divider style={{ margin: '24px 0' }} />

        {/* Experience Filter */}
        <div style={sectionTitleStyle}>
          <ExperimentOutlined style={{ color: '#16a34a' }} />
          Kinh nghiệm
        </div>
        <Select
          size="large"
          style={{ width: '100%' }}
          value={filters.experience}
          onChange={(value) => onFilterChange({ experience: value })}
          options={experienceOptions}
          showSearch
          optionFilterProp="label"
          placeholder="Chọn kinh nghiệm"
        />
      </div>
    </aside>
  );
}
