import { useEffect, useState } from 'react';
import { Card, message } from 'antd';
import { useJobStore } from './store/useJobStore';
import { useAuthStore } from '@/store/useAuthStore';
import JobSearchBar from './components/JobSearchBar';
import JobFilters from './components/JobFilters';
import JobCard from './components/JobCard';

export default function JobsListPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { jobs, loading, filters, fetchJobs, setFilters } = useJobStore();
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  useEffect(() => {
    fetchJobs();
    if (isAuthenticated && user?.id) {
      loadSavedJobs();
    }
  }, [isAuthenticated, user?.id, fetchJobs]);

  const loadSavedJobs = async () => {
    if (!user?.id) return;

    try {
      const { savedJobApi } = await import('@/lib/savedJobApi');
      const saved = await savedJobApi.getUserSavedJobs(user.id);
      setSavedJobs(saved.map((s: any) => s.jobId));
    } catch (error) {
      console.error('Load saved jobs error:', error);
    }
  };

  const toggleSaveJob = async (jobId: number) => {
    if (!isAuthenticated || !user?.id) {
      message.warning('Vui lòng đăng nhập để lưu công việc');
      return;
    }

    if (!jobId || jobId <= 0) {
      console.error('❌ Lỗi: jobId không hợp lệ', jobId);
      message.error('ID công việc không hợp lệ');
      return;
    }

    try {
      const { savedJobApi } = await import('@/lib/savedJobApi');

      if (savedJobs.includes(jobId)) {
        await savedJobApi.unsaveJob(user.id, jobId);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
        message.success('Đã bỏ lưu công việc');
      } else {
        await savedJobApi.saveJob(user.id, jobId);
        setSavedJobs([...savedJobs, jobId]);
        message.success('Đã lưu công việc');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Có lỗi xảy ra';
      console.error('❌ Lỗi lưu/bỏ lưu công việc:', msg);
      message.error(`Không thể lưu công việc: ${msg}`);
    }
  };

  const handleSearch = () => {
    setFilters(filters);
  };

  return (
    <div className="bg-[#f7f8fa]">
      {/* Search Bar */}
      <JobSearchBar
        searchText={filters.searchText || ''}
        location={filters.location || 'all'}
        onSearchChange={(value) => setFilters({ searchText: value })}
        onLocationChange={(value) => setFilters({ location: value })}
        onSearch={handleSearch}
      />

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters */}
          <JobFilters
            filters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
          />

          {/* Results */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Kết quả tìm kiếm việc làm</h2>
                <p className="text-sm text-gray-500">Tìm thấy {jobs.length} công việc phù hợp</p>
              </div>
              <div className="text-sm text-gray-500">Sắp xếp: <span className="text-green-600">Mới nhất</span></div>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobs.includes(job.id)}
                  onSaveToggle={toggleSaveJob}
                />
              ))}
            </div>

            {jobs.length === 0 && !loading && (
              <Card
                style={{
                  textAlign: 'center',
                  padding: 60,
                  borderRadius: 16,
                  border: '1px solid #e5e7eb',
                  marginTop: 16,
                }}
              >
                <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 20, marginBottom: 8, fontWeight: 600, color: '#111827' }}>
                  Không tìm thấy công việc phù hợp
                </h3>
                <p style={{ color: '#6b7280' }}>Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.</p>
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
