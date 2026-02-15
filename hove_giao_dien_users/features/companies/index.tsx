import { CompanySearch } from './components/CompanySearch';
import { CompanyList } from './components/CompanyList';

export const CompaniesFeature = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
          Khám phá các công ty hàng đầu
        </h1>
        <p className="text-lg text-gray-600">
          Tìm hiểu về văn hóa, môi trường làm việc và cơ hội nghề nghiệp
        </p>
      </div>

      <CompanySearch />
      <CompanyList />
    </div>
  );
};
