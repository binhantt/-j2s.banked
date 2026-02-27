// Layout constants - Chuẩn từ Navbar
export const LAYOUT = {
  // Container
  maxWidth: 'max-w-7xl',
  padding: 'px-4 sm:px-6 lg:px-8',
  paddingY: 'py-4',
  
  // Navbar
  navbarHeight: 'h-16',
  navbarPaddingTop: 'pt-16',
  
  // Spacing
  sectionGap: 'mb-4',
  cardGap: 'gap-4',
  
  // Full container class
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  pageWrapper: 'min-h-screen bg-gray-50 pt-16',
};

// Color constants - Bảng màu đầy đủ cho UI
export const COLORS = {
  // 1. Xanh dương/Xanh ngọc (Primary) - 3 sắc độ
  primary: '#3b82f6',           // Blue - Màu chính
  primaryLight: '#60a5fa',      // Blue nhạt - Hover
  primaryDark: '#2563eb',       // Blue đậm
  
  secondary: '#06b6d4',         // Cyan - Màu phụ
  accent: '#14b8a6',            // Teal - Màu nhấn
  
  // Gradient 3 màu cho logo, buttons
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #14b8a6 100%)',
  
  // 2. Trắng
  white: '#FFFFFF',             // Nền chính
  
  // 3. Xám rất nhạt
  grayBg: '#F5F6F7',           // Nền khung chat, list
  grayBgAlt: '#FAFAFA',        // Nền phụ
  
  // 4. Xám trung
  grayText: '#9CA3AF',         // Chữ phụ, timestamp
  grayTextAlt: '#B0B0B0',      // Chữ phụ nhạt hơn
  
  // 5. Xám đậm/Đen
  textPrimary: '#1F2937',      // Tiêu đề, text chính
  textDark: '#333333',         // Text đậm
  
  // 6. Xanh lá (Online status)
  online: '#10b981',           // Chấm "Đang hoạt động"
  
  // 7. Xanh dương nhạt (Hover/Active)
  hoverBg: '#EFF6FF',          // Item đang chọn bên trái
  activeBg: '#DBEAFE',         // Active state
  
  // Tailwind classes tương ứng
  primaryClass: 'blue-600',
  secondaryClass: 'cyan-600',
  accentClass: 'teal-600',
};

// Typography
export const TYPOGRAPHY = {
  h1: 'text-2xl font-bold text-gray-900',
  h2: 'text-xl font-bold text-gray-900',
  h3: 'text-lg font-semibold text-gray-900',
  body: 'text-sm text-gray-600',
  small: 'text-xs text-gray-500',
};
