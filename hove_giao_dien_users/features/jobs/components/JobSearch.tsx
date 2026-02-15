import { Input, Select, Button } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import { useJobStore } from '@/store/useJobStore';

export const JobSearch = () => {
  const { searchQuery, setSearchQuery } = useJobStore();

  return (
    <div className="w-full mb-10">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              size="large"
              placeholder="Tìm theo vị trí, công ty, kỹ năng..."
              prefix={<SearchOutlined className="text-indigo-500 text-lg" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 text-base"
            />
          </div>
          <Select
            placeholder="Địa điểm"
            suffixIcon={<EnvironmentOutlined className="text-indigo-500" />}
            size="large"
            className="w-full md:w-48"
            options={[
              { value: 'all', label: 'Tất cả địa điểm' },
              { value: 'hcm', label: 'TP. Hồ Chí Minh' },
              { value: 'hn', label: 'Hà Nội' },
              { value: 'dn', label: 'Đà Nẵng' },
              { value: 'remote', label: 'Remote' },
            ]}
          />
          <Select
            placeholder="Mức lương"
            suffixIcon={<DollarOutlined className="text-green-500" />}
            size="large"
            className="w-full md:w-48"
            options={[
              { value: 'all', label: 'Tất cả mức lương' },
              { value: '1', label: '$1000 - $2000' },
              { value: '2', label: '$2000 - $3000' },
              { value: '3', label: '$3000+' },
            ]}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            className="h-14 px-8 font-medium text-base"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
};
