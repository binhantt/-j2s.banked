import { Input, Select } from 'antd';
import { SearchOutlined, EnvironmentOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useCompanyStore } from '@/store/useCompanyStore';

export const CompanySearch = () => {
  const { searchQuery, setSearchQuery } = useCompanyStore();

  return (
    <div className="w-full mb-10">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex gap-3 flex-wrap">
          <Input
            size="large"
            placeholder="Tên công ty hoặc từ khóa"
            prefix={<SearchOutlined className="text-indigo-500" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px]"
            style={{ fontSize: '15px' }}
          />
          <Select
            placeholder="Ngành nghề"
            suffixIcon={<AppstoreOutlined className="text-indigo-500" />}
            size="large"
            style={{ width: 200 }}
            options={[
              { value: 'all', label: 'Tất cả ngành' },
              { value: 'it', label: 'Công nghệ thông tin' },
              { value: 'finance', label: 'Tài chính - Ngân hàng' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'education', label: 'Giáo dục' },
            ]}
          />
          <Select
            placeholder="Địa điểm"
            suffixIcon={<EnvironmentOutlined className="text-indigo-500" />}
            size="large"
            style={{ width: 200 }}
            options={[
              { value: 'all', label: 'Tất cả địa điểm' },
              { value: 'hcm', label: 'TP. Hồ Chí Minh' },
              { value: 'hn', label: 'Hà Nội' },
              { value: 'dn', label: 'Đà Nẵng' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
