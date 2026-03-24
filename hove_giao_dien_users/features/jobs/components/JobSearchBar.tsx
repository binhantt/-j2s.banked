import { useEffect, useState } from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { jobApiService } from '../api/jobApi';

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
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    jobApiService.getLocations().then((data) => {
      if (data && data.length > 0) {
        setLocations(data);
      }
    });
  }, []);

  const locationOptions = [
    { value: 'all', label: 'Toàn quốc' },
    ...locations.map((loc) => ({ value: loc, label: loc })),
  ];

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #f0fdf4',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <Input
              size="large"
              placeholder="Từ khóa, chức danh hoặc công ty..."
              prefix={<SearchOutlined style={{ color: '#16a34a' }} />}
              style={{ borderRadius: 999 }}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              onPressEnter={onSearch}
              allowClear
            />
          </div>
          <div style={{ width: '100%' }}>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={location}
              onChange={onLocationChange}
              options={locationOptions}
              showSearch
              optionFilterProp="label"
              placeholder="Chọn khu vực"
            />
          </div>
          <Button
            type="primary"
            size="large"
            onClick={onSearch}
            style={{
              background: '#16a34a',
              border: 'none',
              borderRadius: 999,
              fontWeight: 600,
              height: 40,
              paddingInline: 24,
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
}
