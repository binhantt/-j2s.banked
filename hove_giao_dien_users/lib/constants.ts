// Layout constants
export const LAYOUT = {
  maxWidth: 'max-w-7xl',
  padding: 'px-4 sm:px-6 lg:px-8',
  paddingY: 'py-4',
  navbarHeight: 'h-16',
  navbarPaddingTop: 'pt-16',
  sectionGap: 'mb-4',
  cardGap: 'gap-4',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  pageWrapper: 'min-h-screen bg-gray-50 pt-16',
};

// Color constants - Đồng bộ màu xanh lá #16a34a với admin
export const COLORS = {
  // 1. Xanh lá chính (Primary) - Đồng bộ với admin
  primary: '#16a34a',
  primaryLight: '#22c55e',
  primaryDark: '#15803d',

  // Gradient 3 màu xanh lá
  gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',

  // 2. Trắng
  white: '#FFFFFF',

  // 3. Xám rất nhạt
  grayBg: '#F5F6F7',
  grayBgAlt: '#FAFAFA',

  // 4. Xám trung
  grayText: '#9CA3AF',
  grayTextAlt: '#B0B0B0',

  // 5. Xám đậm/Đen
  textPrimary: '#1F2937',
  textDark: '#333333',

  // 6. Xanh lá nhạt (Online status)
  online: '#16a34a',

  // 7. Xanh lá nhạt (Hover/Active)
  hoverBg: '#f0fdf4',
  activeBg: '#dcfce7',

  // Tailwind classes tương ứng
  primaryClass: 'green-600',
  secondaryClass: 'green-500',
  accentClass: 'green-700',
};

// Typography
export const TYPOGRAPHY = {
  h1: 'text-2xl font-bold text-gray-900',
  h2: 'text-xl font-bold text-gray-900',
  h3: 'text-lg font-semibold text-gray-900',
  body: 'text-sm text-gray-600',
  small: 'text-xs text-gray-500',
};
