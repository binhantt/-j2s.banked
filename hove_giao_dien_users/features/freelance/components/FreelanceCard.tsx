import { Card, Tag, Button, Avatar } from 'antd';
import {
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

interface FreelanceProject {
  id: string;
  title: string;
  client: string;
  clientAvatar: string;
  budget: string;
  duration: string;
  description: string;
  skills: string[];
  proposals: number;
  rating: number;
  postedDate: string;
}

interface FreelanceCardProps {
  project: FreelanceProject;
}

export const FreelanceCard = ({ project }: FreelanceCardProps) => {
  return (
    <Card
      className="h-full border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          src={project.clientAvatar}
          icon={<UserOutlined />}
          size={60}
          className="border border-gray-200 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <Link href={`/freelance/${project.id}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2 cursor-pointer">
              {project.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-base text-gray-700 font-medium">{project.client}</p>
            <div className="flex items-center gap-1 text-yellow-500">
              <StarOutlined />
              <span className="text-sm text-gray-600">{project.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <DollarOutlined className="mr-2 text-green-600 text-lg" />
            <span className="font-bold text-green-600 text-lg">{project.budget}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <ClockCircleOutlined className="mr-2 text-blue-600" />
            <span className="font-medium">{project.duration}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {project.proposals} proposals • Đăng {project.postedDate}
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.skills.map((skill, index) => (
          <Tag key={index} color="green" className="m-0 px-3 py-1">
            {skill}
          </Tag>
        ))}
      </div>

      <Button
        type="primary"
        block
        size="large"
        className="rounded-xl font-medium bg-green-600 hover:bg-green-700"
      >
        Gửi đề xuất
      </Button>
    </Card>
  );
};
