import { Row, Col } from 'antd';
import { FreelanceCard } from './FreelanceCard';

const mockProjects = [
  {
    id: '1',
    title: 'Xây dựng website thương mại điện tử với React & Node.js',
    client: 'Tech Startup Co.',
    clientAvatar: 'https://via.placeholder.com/60',
    budget: '$2000 - $3000',
    duration: '2-3 tháng',
    description:
      'Cần một developer có kinh nghiệm để xây dựng website thương mại điện tử hoàn chỉnh. Yêu cầu có kinh nghiệm với React, Node.js, MongoDB và payment gateway.',
    skills: ['React', 'Node.js', 'MongoDB', 'Payment Gateway'],
    proposals: 15,
    rating: 4.8,
    postedDate: '2 ngày trước',
  },
  {
    id: '2',
    title: 'Thiết kế UI/UX cho ứng dụng mobile iOS & Android',
    client: 'Digital Agency',
    clientAvatar: 'https://via.placeholder.com/60',
    budget: '$1500 - $2500',
    duration: '1 tháng',
    description:
      'Tìm kiếm UI/UX designer để thiết kế giao diện cho ứng dụng mobile. Cần có portfolio về mobile app design và hiểu biết về user experience.',
    skills: ['Figma', 'UI/UX', 'Mobile Design', 'Prototyping'],
    proposals: 23,
    rating: 4.9,
    postedDate: '1 ngày trước',
  },
  {
    id: '3',
    title: 'Phát triển API RESTful cho hệ thống quản lý',
    client: 'Enterprise Solutions',
    clientAvatar: 'https://via.placeholder.com/60',
    budget: '$1000 - $2000',
    duration: '3-4 tuần',
    description:
      'Cần backend developer để xây dựng RESTful API cho hệ thống quản lý nội bộ. Yêu cầu kinh nghiệm với Python/Django hoặc Node.js/Express.',
    skills: ['Python', 'Django', 'REST API', 'PostgreSQL'],
    proposals: 12,
    rating: 4.7,
    postedDate: '3 ngày trước',
  },
  {
    id: '4',
    title: 'Viết content marketing và SEO cho website',
    client: 'Marketing Pro',
    clientAvatar: 'https://via.placeholder.com/60',
    budget: '$500 - $1000',
    duration: '2 tuần',
    description:
      'Tìm content writer có kinh nghiệm về SEO để viết bài cho website. Cần viết 20-30 bài về chủ đề công nghệ và marketing.',
    skills: ['Content Writing', 'SEO', 'Marketing', 'Vietnamese'],
    proposals: 31,
    rating: 4.6,
    postedDate: '1 tuần trước',
  },
  {
    id: '5',
    title: 'Tích hợp payment gateway và shipping API',
    client: 'E-commerce Store',
    clientAvatar: 'https://via.placeholder.com/60',
    budget: '$800 - $1500',
    duration: '2-3 tuần',
    description:
      'Cần developer tích hợp các payment gateway (VNPay, Momo) và shipping API (GHN, GHTK) vào website hiện có.',
    skills: ['Payment Integration', 'API', 'PHP', 'Laravel'],
    proposals: 18,
    rating: 4.8,
    postedDate: '4 ngày trước',
  },
  {
    id: '6',
    title: 'Xây dựng chatbot AI cho customer service',
    client: 'AI Solutions',
    clientAvatar: 'https://via.placeholder.com/60',
    budget: '$3000 - $5000',
    duration: '1-2 tháng',
    description:
      'Tìm AI engineer để xây dựng chatbot thông minh cho hệ thống chăm sóc khách hàng. Yêu cầu kinh nghiệm với NLP và machine learning.',
    skills: ['Python', 'NLP', 'Machine Learning', 'Chatbot'],
    proposals: 8,
    rating: 5.0,
    postedDate: '1 ngày trước',
  },
];

export const FreelanceList = () => {
  return (
    <Row gutter={[24, 24]}>
      {mockProjects.map((project) => (
        <Col key={project.id} xs={24} lg={12}>
          <FreelanceCard project={project} />
        </Col>
      ))}
    </Row>
  );
};
