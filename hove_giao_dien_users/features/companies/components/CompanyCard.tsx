import { Card, Avatar, Tag, Button, Rate } from 'antd';
import {
  EnvironmentOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import SaveCompanyButton from '@/components/SaveCompanyButton';
import type { Company } from '@/store/useCompanyStore';

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard = ({ company }: CompanyCardProps) => {
  return (
    <Card
      className="h-full border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <Avatar
          src={company.logo}
          size={80}
          shape="square"
          className="border border-gray-200"
        />
        <SaveCompanyButton 
          companyId={Number(company.id)} 
          size="small" 
          showText={false}
        />
      </div>

      <Link href={`/companies/${company.id}`}>
        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors cursor-pointer">
          {company.name}
        </h3>
      </Link>

      <div className="flex items-center mb-3">
        <Rate disabled defaultValue={company.rating} className="text-sm" />
        <span className="ml-2 text-gray-600 text-sm">
          {company.rating}
        </span>
      </div>

      <Tag color="blue" className="mb-3">
        {company.industry}
      </Tag>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <EnvironmentOutlined className="mr-2 text-indigo-600" />
          <span>{company.location}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <TeamOutlined className="mr-2 text-indigo-600" />
          <span>{company.size}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <FileTextOutlined className="mr-2 text-green-600" />
          <span className="font-semibold text-green-600">
            {company.openJobs} việc làm đang tuyển
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {company.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-4">
        {company.benefits.slice(0, 3).map((benefit, index) => (
          <Tag key={index} className="text-xs">
            {benefit}
          </Tag>
        ))}
      </div>

      <Link href={`/companies/${company.id}`}>
        <Button type="primary" block size="large" className="rounded-lg">
          Xem chi tiết
        </Button>
      </Link>
    </Card>
  );
};
