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
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Search Bar Section */}
      <JobSearchBar
        searchText={filters.searchText || ''}
        location={filters.location || 'all'}
        onSearchChange={(value) => setFilters({ searchText: value })}
        onLocationChange={(value) => setFilters({ location: value })}
        onSearch={handleSearch}
      />

      {/* Main Content Layout */}
      <div className="max-w-[1240px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
          {/* Left Sidebar - Filters */}
          <JobFilters
            filters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
          />

          {/* Right Content - Results */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">Kết quả tìm kiếm</h2>
                <p className="text-[15px] font-medium text-[#64748b] mt-1">
                  Đã tìm thấy <span className="text-[#16a34a] font-bold">{jobs.length}</span> công việc phù hợp
                </p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-[13px] font-bold text-[#64748b]">
                Sắp xếp: <span className="text-[#16a34a]">Mới nhất</span>
              </div>
            </div>

            <div className="flex flex-col gap-6">
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
                className="mt-6"
                style={{
                  textAlign: 'center',
                  padding: '80px 40px',
                  borderRadius: 24,
                  border: '1px dashed #e2e8f0',
                  background: 'rgba(255,255,255,0.5)',
                }}
              >
                <div style={{ fontSize: 64, marginBottom: 24 }}>🔍</div>
                <h3 className="text-xl font-extrabold text-[#0f172a] mb-2">
                  Không tìm thấy công việc phù hợp
                </h3>
                <p className="text-[#64748b] text-base">
                  Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để có thêm kết quả.
                </p>
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
