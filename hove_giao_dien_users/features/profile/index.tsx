import { Card, Tabs } from 'antd';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { LAYOUT } from '@/lib/constants';
import {
  ProfileHeader,
  CompanyInfoForm,
  PersonalInfoForm,
  JobPostingManagementSection,
  BlogManagementSection,
  ImageGalleryManagementSection,
  SkillsSection,
  CVManagement,
  ExperienceManagement,
  EducationManagement,
  FreelanceManagement,
} from './components';

const { TabPane } = Tabs;

// HR tabs
const HR_TABS = [
  { key: 'thong-tin-cong-ty', label: 'Thông tin công ty', num: '1' },
  { key: 'quan-ly-tin-tuyen-dung', label: 'Quản lý tin tuyển dụng', num: '2' },
  { key: 'quan-ly-freelance', label: '📋 Quản lý Freelance', num: '3' },
  { key: 'quan-ly-blog', label: 'Quản lý Blog', num: '4' },
  { key: 'quan-ly-hinh-anh', label: 'Quản lý hình ảnh', num: '5' },
];

// Job-seeker / freelancer tabs
const JOB_SEEKER_TABS = [
  { key: 'thong-tin-ca-nhan', label: 'Thông tin cá nhân', num: '1' },
  { key: 'quan-ly-cv', label: 'Quản lý CV', num: '2' },
  { key: 'ky-nang', label: 'Kỹ năng', num: '3' },
  { key: 'kinh-nghiem', label: 'Kinh nghiệm', num: '4' },
  { key: 'hoc-van', label: 'Học vấn', num: '5' },
];

const isValidTab = (tab: string | string[] | undefined, tabs: typeof HR_TABS): boolean =>
  tabs.some(t => t.key === tab);

export const ProfileFeature = () => {
  const { user, isAuthenticated } = useAuthStore();
  const nextRouter = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  const tabs = user?.userType === 'hr' ? HR_TABS : JOB_SEEKER_TABS;
  const defaultTab = tabs[0].key;

  // Init active tab from URL on first render
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      nextRouter.push('/login');
    }
  }, [mounted, isAuthenticated, nextRouter]);

  // Sync activeTab from URL query param
  useEffect(() => {
    if (!mounted || !nextRouter.isReady) return;

    const { tab } = nextRouter.query;

    if (!tab || typeof tab !== 'string') {
      setActiveTab(defaultTab);
      nextRouter.replace({ query: { ...nextRouter.query, tab: defaultTab } }, undefined, { shallow: true });
      return;
    }

    if (!isValidTab(tab, tabs)) {
      nextRouter.replace({ query: { ...nextRouter.query, tab: defaultTab } }, undefined, { shallow: true });
      return;
    }

    setActiveTab(tab);
  }, [nextRouter.isReady, nextRouter.query.tab, mounted]);

  const handleTabChange = useCallback(
    (slug: string) => {
      setActiveTab(slug);
      nextRouter.push({ query: { ...nextRouter.query, tab: slug } }, undefined, { shallow: true });
    },
    [nextRouter]
  );

  if (!mounted || !isAuthenticated) {
    return null;
  }

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
  };

  const renderTabContent = (tabKey: string) => {
    if (user?.userType === 'hr') {
      switch (tabKey) {
        case 'thong-tin-cong-ty':
          return <CompanyInfoForm isEditing={isEditing} onSaveSuccess={handleSaveSuccess} />;
        case 'quan-ly-tin-tuyen-dung':
          return <JobPostingManagementSection />;
        case 'quan-ly-freelance':
          return <FreelanceManagement />;
        case 'quan-ly-blog':
          return <BlogManagementSection />;
        case 'quan-ly-hinh-anh':
          return <ImageGalleryManagementSection />;
        default:
          return <CompanyInfoForm isEditing={isEditing} onSaveSuccess={handleSaveSuccess} />;
      }
    }
    switch (tabKey) {
      case 'thong-tin-ca-nhan':
        return <PersonalInfoForm isEditing={isEditing} onSaveSuccess={handleSaveSuccess} />;
      case 'quan-ly-cv':
        return <CVManagement />;
      case 'ky-nang':
        return <SkillsSection isEditing={isEditing} />;
      case 'kinh-nghiem':
        return <ExperienceManagement />;
      case 'hoc-van':
        return <EducationManagement />;
      default:
        return <PersonalInfoForm isEditing={isEditing} onSaveSuccess={handleSaveSuccess} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className={`${LAYOUT.container} py-4`}>
        <ProfileHeader isEditing={isEditing} onToggleEdit={handleToggleEdit} />

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            className="profile-tabs"
          >
            {tabs.map((tab) => (
              <TabPane key={tab.key} tab={tab.label}>
                {activeTab === tab.key && renderTabContent(tab.key)}
              </TabPane>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
};
