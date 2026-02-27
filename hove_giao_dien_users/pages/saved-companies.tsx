import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Empty, Spin, Avatar, Tag, Modal } from 'antd';
import { 
  HeartFilled, 
  EyeOutlined, 
  EnvironmentOutlined, 
  TeamOutlined,
  GlobalOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/MainLayout';
import { savedCompanyApi } from '@/lib/savedCompanyApi';
import { companyApi } from '@/lib/companyApi';
import { useAuthStore } from '@/store/useAuthStore';
import dayjs from 'dayjs';

interface SavedCompanyWithDetails {
  id: number;
  userId: number;
  companyId: number;
  createdAt: string;
  company?: any;
}

export default function SavedCompaniesPage() {
  const [savedCompanies, setSavedCompanies] = useState<SavedCompanyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      loadSavedCompanies();
    }
  }, [user, isAuthenticated, router]);

  const loadSavedCompanies = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const saved = await savedCompanyApi.getUserSavedCompanies(user.id);
      
      // Load company details for each saved company
      const companiesWithDetails = await Promise.all(
        saved.map(async (item: any) => {
          try {
            const company = await companyApi.getCompany(item.companyId);
            return { ...item, company };
          } catch (error) {
            console.error(`Error loading company ${item.companyId}:`, error);
            return item;
          }
        })
      );

      setSavedCompanies(companiesWithDetails);
    } catch (error) {
      console.error('Error loading saved companies:', error);
      message.error('Không thể tải danh sách công ty đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (companyId: number, companyName: string) => {
    if (!user) return;

    Modal.confirm({
      title: 'Xác nhận bỏ lưu',
      content: `Bạn có chắc chắn muốn bỏ lưu công ty "${companyName}"?`,
      okText: 'Bỏ lưu',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await savedCompanyApi.unsaveCompany(user.id, companyId);
          message.success('Đã bỏ lưu công ty');
          loadSavedCompanies();
        } catch (error) {
          console.error('Error unsaving company:', error);
          message.error('Có lỗi xảy ra');
        }
      },
    });
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card 
          title={
            <div className="flex items-center gap-3">
              <HeartFilled className="text-red-500 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold m-0">Công ty đã lưu</h1>
                <p className="text-gray-500 text-sm m-0 font-normal">
                  {savedCompanies.length} công ty
                </p>
              </div>
            </div>
          }
          className="shadow-sm"
        >
          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : savedCompanies.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p className="text-lg font-semibold mb-2">Bạn chưa lưu công ty nào</p>
                  <p className="text-gray-500">Khám phá và lưu các công ty yêu thích của bạn</p>
                </div>
              }
            >
              <Button type="primary" size="large" onClick={() => router.push('/companies')}>
                Khám phá công ty
              </Button>
            </Empty>
          ) : (
            <Row gutter={[24, 24]}>
              {savedCompanies.map((item) => {
                const company = item.company;
                if (!company) return null;

                return (
                  <Col key={item.id} xs={24} sm={12} lg={8}>
                    <Card
                      hoverable
                      className="h-full"
                      cover={
                        <div 
                          className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center relative"
                          style={{
                            backgroundImage: company.logoUrl ? `url(${company.logoUrl})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {!company.logoUrl && (
                            <Avatar size={80} className="bg-white text-blue-600 text-3xl font-bold">
                              {company.name?.charAt(0)}
                            </Avatar>
                          )}
                          <div className="absolute top-2 right-2">
                            <Button
                              type="primary"
                              danger
                              shape="circle"
                              icon={<HeartFilled />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnsave(company.id, company.name);
                              }}
                            />
                          </div>
                        </div>
                      }
                      actions={[
                        <Button
                          key="view"
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => router.push(`/companies/${company.id}`)}
                        >
                          Xem chi tiết
                        </Button>,
                        <Button
                          key="unsave"
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleUnsave(company.id, company.name)}
                        >
                          Bỏ lưu
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div 
                            className="text-lg font-bold cursor-pointer hover:text-blue-600"
                            onClick={() => router.push(`/companies/${company.id}`)}
                          >
                            {company.name}
                          </div>
                        }
                        description={
                          <div className="space-y-2">
                            {company.industry && (
                              <Tag color="blue">{company.industry}</Tag>
                            )}
                            {company.address && (
                              <div className="flex items-start gap-2 text-gray-600 text-sm">
                                <EnvironmentOutlined className="mt-1" />
                                <span className="line-clamp-1">{company.address}</span>
                              </div>
                            )}
                            {company.companySize && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <TeamOutlined />
                                <span>{company.companySize}</span>
                              </div>
                            )}
                            {company.website && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <GlobalOutlined />
                                <a 
                                  href={company.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Website
                                </a>
                              </div>
                            )}
                            <div className="text-gray-400 text-xs mt-3 pt-3 border-t">
                              Đã lưu: {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
