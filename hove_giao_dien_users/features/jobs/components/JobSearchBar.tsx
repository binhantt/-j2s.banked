import { useEffect, useState } from 'react';
import { Input, Select, Button } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
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
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      padding: '32px 0 40px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 8,
          boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          border: '1px solid rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
        }}>
          {/* Keyword Search */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <SearchOutlined style={{ color: '#16a34a', fontSize: 18, marginRight: 12 }} />
            <Input
              variant="borderless"
              placeholder="Từ khóa, chức danh hoặc công ty..."
              style={{ fontSize: 15, width: '100%' }}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              onPressEnter={onSearch}
              allowClear
            />
          </div>

          <div style={{ width: 1, height: 32, background: '#f1f5f9', display: 'none' }} className="lg:block" />

          {/* Location Selection */}
          <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <EnvironmentOutlined style={{ color: '#16a34a', fontSize: 18, marginRight: 12 }} />
            <Select
              variant="borderless"
              style={{ width: '100%', fontSize: 15 }}
              value={location}
              onChange={onLocationChange}
              options={locationOptions}
              showSearch
              optionFilterProp="label"
              placeholder="Toàn quốc"
            />
          </div>

          {/* Search Button */}
          <Button
            type="primary"
            onClick={onSearch}
            style={{
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              border: 'none',
              fontWeight: 700,
              fontSize: 15,
              paddingInline: 32,
              boxShadow: '0 6px 16px rgba(22,163,74,0.15)',
              marginLeft: 'auto',
            }}
          >
            Tìm nhanh
          </Button>
        </div>
      </div>
    </div>
  );
}
