import { FreelanceSearch } from './components/FreelanceSearch';
import { FreelanceList } from './components/FreelanceList';

export const FreelanceFeature = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-600 to-green-600 mb-3">
          Dự án freelance
        </h1>
        <p className="text-lg text-gray-600">
          Tìm kiếm dự án freelance phù hợp với kỹ năng của bạn
        </p>
      </div>

      <FreelanceSearch />
      <FreelanceList />
    </div>
  );
};
