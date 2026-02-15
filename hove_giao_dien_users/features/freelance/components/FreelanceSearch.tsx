import { Input, Select, Button } from 'antd';
import { SearchOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';

export const FreelanceSearch = () => {
  return (
    <div className="w-full mb-10">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              size="large"
              placeholder="Tìm dự án theo kỹ năng, công nghệ..."
              prefix={<SearchOutlined className="text-green-500 text-lg" />}
              className="h-14 text-base"
            />
          </div>
          <Select
            placeholder="Ngân sách"
            suffixIcon={<DollarOutlined className="text-green-500" />}
            size="large"
            className="w-full md:w-48"
            options={[
              { value: 'all', label: 'Tất cả ngân sách' },
              { value: '1', label: '$100 - $500' },
              { value: '2', label: '$500 - $1000' },
              { value: '3', label: '$1000 - $5000' },
              { value: '4', label: '$5000+' },
            ]}
          />
          <Select
            placeholder="Thời gian"
            suffixIcon={<ClockCircleOutlined className="text-green-500" />}
            size="large"
            className="w-full md:w-48"
            options={[
              { value: 'all', label: 'Tất cả thời gian' },
              { value: '1', label: '< 1 tuần' },
              { value: '2', label: '1-2 tuần' },
              { value: '3', label: '1 tháng' },
              { value: '4', label: '> 1 tháng' },
            ]}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            className="h-14 px-8 font-medium text-base bg-green-600 hover:bg-green-700"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
};
