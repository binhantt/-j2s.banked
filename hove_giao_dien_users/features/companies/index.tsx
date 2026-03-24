import { CompanySearch } from './components/CompanySearch';
import { CompanyList } from './components/CompanyList';

export { CompanyDetailFeature } from './CompanyDetailFeature';

export const CompaniesFeature = () => {
  return (
    <div style={{ background: '#f3f6fb', minHeight: '100vh', paddingBottom: 32 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CompanySearch />
        <CompanyList />
      </div>
    </div>
  );
};
