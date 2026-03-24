import { Card, Tabs } from 'antd';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';
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

export const ProfileFeature = () => {
  const { user, isAuthenticated } = useAuthStore();
  const nextRouter = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      nextRouter.push('/login');
    }
  }, [mounted, isAuthenticated, nextRouter]);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className={`${LAYOUT.container} py-4`}>
        <ProfileHeader isEditing={isEditing} onToggleEdit={handleToggleEdit} />

        <Card>
          {user?.userType === 'hr' ? (
            <Tabs defaultActiveKey="1" className="profile-tabs">
              <TabPane tab="Thông tin công ty" key="1">
                <CompanyInfoForm isEditing={isEditing} onSaveSuccess={handleSaveSuccess} />
              </TabPane>
              <TabPane tab="Quản lý tin tuyển dụng" key="2">
                <JobPostingManagementSection />
              </TabPane>
              <TabPane tab="📋 Quản lý Freelance" key="3">
                <FreelanceManagement />
              </TabPane>
              <TabPane tab="Quản lý Blog" key="4">
                <BlogManagementSection />
              </TabPane>
              <TabPane tab="Quản lý hình ảnh" key="5">
                <ImageGalleryManagementSection />
              </TabPane>
            </Tabs>
          ) : (
            <Tabs defaultActiveKey="1" className="profile-tabs">
              <TabPane tab="Thông tin cá nhân" key="1">
                <PersonalInfoForm isEditing={isEditing} onSaveSuccess={handleSaveSuccess} />
              </TabPane>
              <TabPane tab="Quản lý CV" key="2">
                <CVManagement />
              </TabPane>
              <TabPane tab="Kỹ năng" key="3">
                <SkillsSection isEditing={isEditing} />
              </TabPane>
              <TabPane tab="Kinh nghiệm" key="4">
                <ExperienceManagement />
              </TabPane>
              <TabPane tab="Học vấn" key="5">
                <EducationManagement />
              </TabPane>
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  );
};
