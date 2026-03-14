import { Input, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface JobSearchBarProps {
  searchText: string;
  location: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

export default function JobSearchBar({
  searchText,
  location,
  onSearchChange,
  onLocationChange,
  onSearch,
}: JobSearchBarProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              size="large"
              className="rounded-full"
              placeholder="Từ khóa, chức danh hoặc công ty..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              style={{ borderRadius: 999 }}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              onPressEnter={onSearch}
              allowClear
            />
          </div>
          <div className="w-full lg:w-64">
            <Select
              size="large"
              className="w-full rounded-full"
              value={location}
              onChange={onLocationChange}
              options={[
                { value: 'all', label: 'Toàn quốc' },
                { value: 'Hà Nội', label: 'Hà Nội' },
                { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
                { value: 'Đà Nẵng', label: 'Đà Nẵng' },
                { value: 'Cần Thơ', label: 'Cần Thơ' },
                { value: 'Hải Phòng', label: 'Hải Phòng' },
              ]}
            />
          </div>
          <Button
            type="primary"
            size="large"
            className="!bg-orange-500 rounded-full px-6"
            onClick={onSearch}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
}
