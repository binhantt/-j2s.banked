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
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
          borderBottom: '1px solid #dcfce7',
          padding: '64px 0 48px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
          }} />

          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, 
              padding: '6px 16px', borderRadius: 100, background: '#f0fdf4', 
              border: '1px solid #dcfce7', marginBottom: 20 
            }}>
              <HeartFilled style={{ color: '#16a34a', fontSize: 14 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Danh sách ưu tiên
              </span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Công ty <span style={{ color: '#16a34a' }}>đã lưu</span>
            </h1>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 600 }}>
              Xem lại các doanh nghiệp bạn đang quan tâm và cập nhật cơ hội việc làm mới nhất từ họ.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" />
              <p style={{ color: '#64748b', marginTop: 16 }}>Đang tải danh sách...</p>
            </div>
          ) : savedCompanies.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 24, padding: 80, textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Bạn chưa lưu công ty nào</p>
                    <p style={{ color: '#64748b' }}>Khám phá các doanh nghiệp để tìm kiếm nơi làm việc lý tưởng.</p>
                  </div>
                }
              >
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={() => router.push('/companies')}
                  style={{ 
                    height: 48, borderRadius: 12, 
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)', 
                    border: 'none', fontWeight: 700, marginTop: 12,
                    paddingInline: 32, boxShadow: '0 4px 12px rgba(22,163,74,0.15)'
                  }}
                >
                  Khám phá công ty
                </Button>
              </Empty>
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {savedCompanies.map((item) => {
                const company = item.company;
                if (!company) return null;

                return (
                  <Col key={item.id} xs={24} sm={12} lg={8}>
                    <div 
                      className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_-10px_rgba(22,163,74,0.12)] transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden group cursor-pointer flex flex-col h-full"
                      onClick={() => router.push(`/companies/${company.id}`)}
                    >
                      <div className="h-40 flex items-center justify-center relative overflow-hidden">
                        <div 
                          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                          style={{
                            backgroundImage: company.logoUrl ? `url(${company.logoUrl})` : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            filter: company.logoUrl ? 'blur(8px) brightness(0.6)' : 'none'
                          }}
                        />
                        {company.logoUrl && <div className="absolute inset-0 bg-black/40" />}
                        <div className="relative z-10">
                          <Avatar 
                            size={80} className="shadow-xl border-4 border-white/20 backdrop-blur-sm"
                            style={{ background: '#fff', color: '#16a34a', fontSize: 36, fontWeight: 800 }}
                            src={company.logoUrl}
                          >
                            {!company.logoUrl && (company.name?.charAt(0))}
                          </Avatar>
                        </div>
                        <Button
                          type="primary" danger shape="circle" icon={<HeartFilled className="text-lg" />}
                          className="!absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleUnsave(company.id, company.name); }}
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 mb-2 text-center">
                          {company.name}
                        </h3>
                        <div className="flex justify-center flex-wrap gap-2 mb-4">
                          {company.industry && <Tag className="rounded-full px-3 py-1 border-0 bg-green-50 text-green-600 font-semibold text-xs m-0">{company.industry}</Tag>}
                        </div>
                        <div className="flex flex-col gap-3 text-sm text-gray-600 mt-2 mb-6 flex-grow">
                          {company.address && (
                            <div className="flex items-start gap-3">
                              <EnvironmentOutlined className="text-gray-400 text-base mt-0.5" />
                              <span className="line-clamp-2 font-medium leading-relaxed">{company.address}</span>
                            </div>
                          )}
                          {company.companySize && (
                            <div className="flex items-center gap-3">
                              <TeamOutlined className="text-gray-400 text-base" />
                              <span className="font-medium">{company.companySize} nhân viên</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
                          <div className="text-xs font-semibold text-gray-400">
                            Lưu ngày: {dayjs(item.createdAt).format('DD/MM/YYYY')}
                          </div>
                          <span className="text-green-600 font-semibold text-sm group-hover:underline">Chi tiết &rarr;</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
