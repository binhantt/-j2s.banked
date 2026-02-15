import { Button, Card, Tag, Row, Col, Avatar, Divider, Progress, Input } from 'antd';
import {
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  ShareAltOutlined,
  MessageOutlined,
  SendOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface FreelanceDetailFeatureProps {
  projectId: string;
}

export const FreelanceDetailFeature = ({ projectId }: FreelanceDetailFeatureProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const { canApplyFreelance } = usePermissions();

  const project = {
    id: projectId,
    title: 'Xây dựng website thương mại điện tử với React & Node.js',
    client: 'Tech Startup Co.',
    clientAvatar: 'https://via.placeholder.com/80',
    clientRating: 4.8,
    clientReviews: 45,
    clientJobsPosted: 23,
    budget: '$2000 - $3000',
    duration: '2-3 tháng',
    postedDate: '2 ngày trước',
    proposals: 15,
    description: `Chúng tôi đang tìm kiếm một developer có kinh nghiệm để xây dựng một website thương mại điện tử hoàn chỉnh từ đầu.

Website cần có đầy đủ các tính năng cơ bản của một trang thương mại điện tử hiện đại, bao gồm quản lý sản phẩm, giỏ hàng, thanh toán online, và quản lý đơn hàng.`,
    requirements: [
      'Có ít nhất 2 năm kinh nghiệm với React và Node.js',
      'Thành thạo MongoDB hoặc PostgreSQL',
      'Kinh nghiệm tích hợp payment gateway (VNPay, Momo, etc.)',
      'Hiểu biết về RESTful API và authentication',
      'Có khả năng làm việc độc lập và giao tiếp tốt',
      'Ưu tiên có kinh nghiệm với Next.js và TypeScript',
    ],
    deliverables: [
      'Source code đầy đủ với documentation',
      'Database schema và migration scripts',
      'Admin panel để quản lý',
      'Responsive design cho mobile',
      'Testing và bug fixing',
      'Deployment và hướng dẫn sử dụng',
    ],
    skills: ['React', 'Node.js', 'MongoDB', 'Payment Gateway', 'Next.js', 'TypeScript'],
  };

  const similarProjects = [
    {
      id: '2',
      title: 'Thiết kế UI/UX cho ứng dụng mobile',
      budget: '$1500 - $2500',
      proposals: 23,
    },
    {
      id: '3',
      title: 'Phát triển API RESTful',
      budget: '$1000 - $2000',
      proposals: 12,
    },
  ];

  const mockChatMessages = [
    {
      id: '1',
      sender: 'client',
      name: 'Tech Startup Co.',
      avatar: 'https://via.placeholder.com/40',
      message: 'Xin chào! Cảm ơn bạn quan tâm đến dự án. Bạn có kinh nghiệm với payment gateway không?',
      time: '10:30',
    },
    {
      id: '2',
      sender: 'user',
      name: 'Bạn',
      avatar: 'https://via.placeholder.com/40',
      message: 'Chào anh, em có 3 năm kinh nghiệm với VNPay và Momo ạ.',
      time: '10:32',
    },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8">
      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card className="mb-6 border border-gray-200 rounded-2xl">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills.map((skill, index) => (
                  <Tag key={index} color="green" className="px-3 py-1 text-sm">
                    {skill}
                  </Tag>
                ))}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <span>Đăng {project.postedDate}</span>
                <span>•</span>
                <span>{project.proposals} proposals</span>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              {canApplyFreelance && (
                <Button
                  type="primary"
                  size="large"
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                >
                  Gửi đề xuất
                </Button>
              )}
              <Button
                size="large"
                icon={<MessageOutlined />}
                onClick={() => setIsChatOpen(true)}
                className="px-6"
              >
                Chat với khách hàng
              </Button>
              <Button size="large" icon={<HeartOutlined />} className="h-12" />
              <Button size="large" icon={<ShareAltOutlined />} className="h-12" />
            </div>

            <Divider />

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mô tả dự án
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            <Divider />

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Yêu cầu
              </h3>
              <ul className="space-y-3">
                {project.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleOutlined className="text-green-600 mr-3 mt-1 text-lg" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Divider />

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Deliverables
              </h3>
              <ul className="space-y-3">
                {project.deliverables.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleOutlined className="text-green-600 mr-3 mt-1 text-lg" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Project Info */}
          <Card className="mb-6 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Thông tin dự án
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-gray-600 mb-1 flex items-center">
                  <DollarOutlined className="mr-2 text-green-600" />
                  Ngân sách
                </div>
                <div className="font-bold text-green-600 text-2xl">
                  {project.budget}
                </div>
              </div>
              <Divider className="my-3" />
              <div>
                <div className="text-gray-600 mb-1 flex items-center">
                  <ClockCircleOutlined className="mr-2 text-blue-600" />
                  Thời gian
                </div>
                <div className="font-semibold text-gray-900">
                  {project.duration}
                </div>
              </div>
              <Divider className="my-3" />
              <div>
                <div className="text-gray-600 mb-1">Proposals</div>
                <div className="font-semibold text-gray-900">
                  {project.proposals} freelancers đã gửi đề xuất
                </div>
                <Progress
                  percent={60}
                  strokeColor="#16a34a"
                  showInfo={false}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Client Info */}
          <Card className="mb-6 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Thông tin khách hàng
            </h3>
            <div className="text-center mb-4">
              <Avatar
                src={project.clientAvatar}
                size={80}
                icon={<UserOutlined />}
                className="mb-3"
              />
              <h4 className="text-lg font-semibold text-gray-900">
                {project.client}
              </h4>
              <div className="flex items-center justify-center gap-2 mt-2">
                <StarOutlined className="text-yellow-500" />
                <span className="font-semibold">{project.clientRating}</span>
                <span className="text-gray-600">({project.clientReviews} reviews)</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Dự án đã đăng:</span>
                <span className="font-semibold">{project.clientJobsPosted}</span>
              </div>
              <div className="flex justify-between">
                <span>Tỷ lệ thuê:</span>
                <span className="font-semibold">85%</span>
              </div>
            </div>
            <Button type="default" block size="large" className="mt-4">
              Xem hồ sơ khách hàng
            </Button>
          </Card>

          {/* Similar Projects */}
          <Card className="border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Dự án tương tự
            </h3>
            <div className="space-y-4">
              {similarProjects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/freelance/${proj.id}`}
                  className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {proj.title}
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-semibold">
                      {proj.budget}
                    </span>
                    <span className="text-gray-600">
                      {proj.proposals} proposals
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            type="primary"
            size="large"
            onClick={() => setIsChatOpen(true)}
            className="h-16 w-16 rounded-full shadow-2xl flex items-center justify-center bg-gradient-to-br from-green-600 to-teal-600 border-0 hover:from-green-700 hover:to-teal-700 hover:scale-110 transition-transform"
          >
            <MessageOutlined className="text-2xl" />
          </Button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <Avatar
                  src={project.clientAvatar}
                  icon={<UserOutlined />}
                  size={45}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="font-semibold text-base">
                  {project.client}
                </div>
                <div className="text-xs opacity-90">Online</div>
              </div>
            </div>
            <Button
              type="text"
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {/* Welcome Message */}
            <div className="flex gap-2">
              <Avatar
                src={project.clientAvatar}
                size={32}
                className="flex-shrink-0"
              />
              <div className="flex-1">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <p className="text-sm text-gray-800">
                    Xin chào! 👋 Cảm ơn bạn quan tâm đến dự án của chúng tôi.
                  </p>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-2">10:30</div>
              </div>
            </div>

            {mockChatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {msg.sender !== 'user' && (
                  <Avatar src={msg.avatar} size={32} className="flex-shrink-0" />
                )}
                <div className={`flex-1 ${msg.sender === 'user' ? 'flex flex-col items-end' : ''}`}>
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl max-w-[280px] ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 shadow-sm rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${msg.sender === 'user' ? 'mr-2' : 'ml-2'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button size="small" className="rounded-full text-xs whitespace-nowrap">
                Kinh nghiệm của tôi
              </Button>
              <Button size="small" className="rounded-full text-xs whitespace-nowrap">
                Timeline dự án
              </Button>
              <Button size="small" className="rounded-full text-xs whitespace-nowrap">
                Báo giá chi tiết
              </Button>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                placeholder="Nhập tin nhắn..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onPressEnter={() => {
                  if (chatMessage.trim()) {
                    console.log('Send:', chatMessage);
                    setChatMessage('');
                  }
                }}
                className="flex-1 rounded-full"
                suffix={
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    size="small"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      if (chatMessage.trim()) {
                        console.log('Send:', chatMessage);
                        setChatMessage('');
                      }
                    }}
                  />
                }
              />
            </div>
            <div className="text-xs text-gray-400 text-center mt-2">
              Powered by ViệcLàm24h
            </div>
          </div>
        </div>
      )}
    </>
  );
};
