import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useBlogStore } from '@/store/useBlogStore';
import { BlogList } from './components/BlogList';

export const BlogFeature = () => {
  const { searchQuery, selectedCategory, setSearchQuery, setSelectedCategory } =
    useBlogStore();

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Kỹ năng', label: 'Kỹ năng' },
    { value: 'Nghề nghiệp', label: 'Nghề nghiệp' },
    { value: 'Công nghệ', label: 'Công nghệ' },
    { value: 'Phỏng vấn', label: 'Phỏng vấn' },
    { value: 'Lối sống', label: 'Lối sống' },
    { value: 'Lương thưởng', label: 'Lương thưởng' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 mb-3">
          Blog & Cẩm nang nghề nghiệp
        </h1>
        <p className="text-lg text-gray-600">
          Chia sẻ kiến thức, kinh nghiệm và xu hướng trong thế giới công việc
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-10">
        <div className="flex gap-3 flex-wrap">
          <Input
            size="large"
            placeholder="Tìm kiếm bài viết..."
            prefix={<SearchOutlined className="text-blue-500" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px]"
            style={{ fontSize: '15px' }}
          />
          <Select
            size="large"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories}
            style={{ width: 200 }}
          />
        </div>
      </div>

      <BlogList />
    </div>
  );
};
