import { CompanySearch } from './components/CompanySearch';
import { CompanyList } from './components/CompanyList';

export { CompanyDetailFeature } from './CompanyDetailFeature';

export const CompaniesFeature = () => {
  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <CompanySearch />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 48px' }}>
        <CompanyList />
      </div>
    </div>
  );
};
