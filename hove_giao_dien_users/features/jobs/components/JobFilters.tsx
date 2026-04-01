import { Select, Checkbox, Divider } from 'antd';
import { JobFilters as JobFiltersType, ExperienceOption } from '../api/jobApi';
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

// Predefined experience options (INT values)
const experienceOptions: ExperienceOption[] = [
  { value: 0, label: 'Không yêu cầu' },
  { value: 1, label: '1 năm' },
  { value: 2, label: '2 năm' },
  { value: 3, label: '3 năm' },
  { value: 5, label: '5 năm' },
  { value: 7, label: '7+ năm' },
];

export default function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
  const getExpLabel = (value: number) => {
    const opt = experienceOptions.find((o) => o.value === value);
    return opt ? opt.label : `${value} năm`;
  };

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

        {/* Experience Filter - Range Slider (INT) */}
        <div style={sectionTitleStyle}>
          <ExperimentOutlined style={{ color: '#16a34a' }} />
          Kinh nghiệm
        </div>

        {/* Range display */}
        <div style={{ marginBottom: 8, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
          {filters.experienceMin === undefined && filters.experienceMax === undefined
            ? 'Tất cả kinh nghiệm'
            : `${getExpLabel(filters.experienceMin ?? 0)} — ${getExpLabel(filters.experienceMax ?? 7)}`}
        </div>

        {/* Experience Range Select */}
        <Select
          size="large"
          style={{ width: '100%' }}
          placeholder="Chọn khoảng kinh nghiệm"
          value={
            filters.experienceMin !== undefined || filters.experienceMax !== undefined
              ? `${filters.experienceMin ?? 0}-${filters.experienceMax ?? 7}`
              : 'all'
          }
          onChange={(value) => {
            if (value === 'all') {
              onFilterChange({ experienceMin: undefined, experienceMax: undefined });
            } else {
              const [min, max] = value.split('-').map(Number);
              onFilterChange({ experienceMin: min, experienceMax: max });
            }
          }}
          options={[
            { value: 'all', label: 'Tất cả kinh nghiệm' },
            { value: '0-1', label: 'Không yêu cầu - 1 năm' },
            { value: '1-3', label: '1 - 3 năm' },
            { value: '3-5', label: '3 - 5 năm' },
            { value: '5-7', label: '5 - 7+ năm' },
          ]}
        />
      </div>
    </aside>
  );
}
