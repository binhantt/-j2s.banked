/**
 * React Query / TanStack Query Client
 *
 * Cấu hình tối ưu cho 50,000+ users:
 * - staleTime: 5 phút — không refetch liên tục khi data còn fresh
 * - gcTime: 10 phút — giữ cache đủ lâu để reuse khi user quay lại
 * - retry: 1 — retry 1 lần khi fail, không spam retry
 * - refetchOnWindowFocus: false — không refetch khi tab background
 *   (tiết kiệm server resources, notifications vẫn update qua interval)
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data được coi là "fresh" trong 5 phút
      // Trong thời gian này → không gọi API lại
      staleTime: 5 * 60 * 1000, // 5 phút

      // Cache tối đa 10 phút — sau đó xóa khỏi memory
      gcTime: 10 * 60 * 1000, // 10 phút

      // Retry 1 lần khi request fail (network error, 5xx)
      retry: 1,

      // KHÔNG refetch khi tab quay lại (Next.js tab switch)
      // Tiết kiệm server resources cho 50K users
      refetchOnWindowFocus: false,

      // Refetch khi network恢复 (mất mạng rồi có lại)
      refetchOnReconnect: true,

      // Debounce refetch — tránh spam khi component mount/unmount nhanh
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Retry 0 lần cho mutations (tạo/sửa/xóa)
      // Thất bại → hiện error ngay, không tự động retry
      retry: 0,
    },
  },
});

/**
 * Query keys — dùng chuẩn đặt tên để dễ invalidate
 * Ví dụ: queryClient.invalidateQueries({ queryKey: ['notifications'] })
 */
export const queryKeys = {
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: (userId: number) => ['notifications', 'unread', userId] as const,
    count: (userId: number) => ['notifications', 'count', userId] as const,
    navbar: (userId: number) => ['notifications', 'navbar', userId] as const,
  },
  // Jobs
  jobs: {
    all: ['jobs'] as const,
    list: (page: number, size: number) => ['jobs', 'list', page, size] as const,
    detail: (id: number) => ['jobs', 'detail', id] as const,
    saved: (userId: number) => ['jobs', 'saved', userId] as const,
  },
  // Companies
  companies: {
    all: ['companies'] as const,
    list: (page: number, size: number) => ['companies', 'list', page, size] as const,
    detail: (id: number) => ['companies', 'detail', id] as const,
  },
  // Blog
  blog: {
    all: ['blog'] as const,
    list: (page: number) => ['blog', 'list', page] as const,
    detail: (id: number) => ['blog', 'detail', id] as const,
  },
  // Applications
  applications: {
    all: ['applications'] as const,
    my: (userId: number) => ['applications', 'my', userId] as const,
  },
  // User profile
  profile: {
    me: (userId: number) => ['profile', 'me', userId] as const,
  },
  // Saved items
  saved: {
    items: (userId: number) => ['saved', 'items', userId] as const,
    companies: (userId: number) => ['saved', 'companies', userId] as const,
    jobs: (userId: number) => ['saved', 'jobs', userId] as const,
  },
} as const;
