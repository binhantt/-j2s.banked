import { Tabs, Row, Col, Spin } from 'antd';
import { EmptySavedState } from './EmptySavedState';
import { SavedJobCard } from './SavedJobCard';
import { SavedCompanyCard } from './SavedCompanyCard';

interface SavedItemsTabsProps {
  loadingJobs: boolean;
  loadingCompanies: boolean;
  savedJobs: any[];
  savedCompanies: any[];
  onViewJob: (id: number) => void;
  onUnsaveJob: (id: number, title: string) => void;
  onViewCompany: (id: number) => void;
  onUnsaveCompany: (id: number, name: string) => void;
  onGoJobs: () => void;
  onGoCompanies: () => void;
}

export const SavedItemsTabs = ({
  loadingJobs,
  loadingCompanies,
  savedJobs,
  savedCompanies,
  onViewJob,
  onUnsaveJob,
  onViewCompany,
  onUnsaveCompany,
  onGoJobs,
  onGoCompanies,
}: SavedItemsTabsProps) => {
  const tabItems = [
    {
      key: 'jobs',
      label: `Việc làm (${savedJobs.length})`,
      children: loadingJobs ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptySavedState
          title="Bạn chưa lưu việc làm nào"
          description="Khám phá và lưu các việc làm phù hợp với bạn"
          actionLabel="Tìm việc làm"
          onAction={onGoJobs}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {savedJobs.map((item) => {
            const job = item.job;
            if (!job) return null;
            return (
              <Col key={item.id} xs={24} sm={12} lg={8}>
                <SavedJobCard
                  job={job}
                  savedAt={item.createdAt}
                  onView={() => onViewJob(job.id)}
                  onUnsave={() => onUnsaveJob(job.id, job.title)}
                />
              </Col>
            );
          })}
        </Row>
      ),
    },
    {
      key: 'companies',
      label: `Công ty (${savedCompanies.length})`,
      children: loadingCompanies ? (
        <div className="text-center py-12">
          <Spin size="large" />
          <p className="text-gray-500 mt-4">Đang tải...</p>
        </div>
      ) : savedCompanies.length === 0 ? (
        <EmptySavedState
          title="Bạn chưa lưu công ty nào"
          description="Khám phá và lưu các công ty yêu thích của bạn"
          actionLabel="Khám phá công ty"
          onAction={onGoCompanies}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {savedCompanies.map((item) => {
            const company = item.company;
            if (!company) return null;
            return (
              <Col key={item.id} xs={24} sm={12} lg={8}>
                <SavedCompanyCard
                  company={company}
                  savedAt={item.createdAt}
                  onView={() => onViewCompany(company.id)}
                  onUnsave={() => onUnsaveCompany(company.id, company.name)}
                />
              </Col>
            );
          })}
        </Row>
      ),
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-saved-tabs .ant-tabs-nav::before { display: none; }
        .custom-saved-tabs .ant-tabs-nav { margin-bottom: 32px; }
        .custom-saved-tabs .ant-tabs-tab { padding: 12px 0; margin: 0 24px !important; font-size: 16px; transition: all 0.3s ease; }
        .custom-saved-tabs .ant-tabs-tab:hover { color: #16a34a; }
        .custom-saved-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #16a34a !important; text-shadow: none; font-weight: 700; transform: scale(1.05); }
        .custom-saved-tabs .ant-tabs-ink-bar { background: #16a34a; height: 4px !important; border-radius: 4px; }
      `}} />
      <Tabs defaultActiveKey="jobs" items={tabItems} size="large" className="custom-saved-tabs" centered />
    </>
  );
};
