import { Select, Checkbox } from 'antd';
import { JobFilters as JobFiltersType } from '../api/jobApi';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFilterChange: (filters: Partial<JobFiltersType>) => void;
}

export default function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
  return (
    <aside>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <div className="font-semibold text-gray-800 mb-3">Bộ lọc nâng cao</div>
        <div className="text-xs text-gray-500">Lọc theo nhu cầu của bạn</div>
      </div>

      {/* Job Type Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <div className="font-semibold text-gray-800 mb-3">Loại hình công việc</div>
        <Checkbox.Group
          className="flex flex-col gap-2"
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
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <div className="font-semibold text-gray-800 mb-3">Mức lương</div>
        <Select
          size="large"
          className="w-full"
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
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="font-semibold text-gray-800 mb-3">Kinh nghiệm</div>
        <Select
          size="large"
          className="w-full"
          value={filters.experience}
          onChange={(value) => onFilterChange({ experience: value })}
          options={[
            { value: 'all', label: 'Tất cả kinh nghiệm' },
            { value: 'junior', label: 'Junior' },
            { value: 'middle', label: 'Middle' },
            { value: 'senior', label: 'Senior' },
          ]}
        />
      </div>
    </aside>
  );
}
