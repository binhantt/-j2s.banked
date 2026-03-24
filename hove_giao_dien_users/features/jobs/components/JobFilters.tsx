import { useEffect, useState } from 'react';
import { Select, Checkbox } from 'antd';
import { JobFilters as JobFiltersType, jobApiService } from '../api/jobApi';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFilterChange: (filters: Partial<JobFiltersType>) => void;
}

const filterCardStyle = {
  background: '#fff',
  borderRadius: 14,
  border: '1px solid #f0fdf4',
  padding: 20,
  marginBottom: 16,
};

const sectionTitleStyle = {
  fontWeight: 700,
  fontSize: 14,
  color: '#0b1220',
  marginBottom: 12,
};

const sectionSubStyle = {
  fontSize: 12,
  color: '#94a3b8',
  marginBottom: 4,
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
    <aside>
      <div style={{ ...filterCardStyle, marginBottom: 16 }}>
        <div style={sectionTitleStyle}>Bộ lọc nâng cao</div>
        <div style={sectionSubStyle}>Lọc theo nhu cầu của bạn</div>
      </div>

      {/* Job Type Filter */}
      <div style={filterCardStyle}>
        <div style={sectionTitleStyle}>Loại hình công việc</div>
        <Checkbox.Group
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          value={filters.jobType}
          onChange={(values) => onFilterChange({ jobType: values as string[] })}
          options={[
            { label: 'Toàn thời gian', value: 'full-time' },
            { label: 'Bán thời gian', value: 'part-time' },
            { label: 'Thực tập', value: 'internship' },
            { label: 'Freelance', value: 'contract' },
          ]}
        />
      </div>

      {/* Salary Filter */}
      <div style={filterCardStyle}>
        <div style={sectionTitleStyle}>Mức lương</div>
        <Select
          size="large"
          style={{ width: '100%', borderRadius: 10 }}
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
      </div>

      {/* Experience Filter */}
      <div style={filterCardStyle}>
        <div style={sectionTitleStyle}>Kinh nghiệm</div>
        <Select
          size="large"
          style={{ width: '100%', borderRadius: 10 }}
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
