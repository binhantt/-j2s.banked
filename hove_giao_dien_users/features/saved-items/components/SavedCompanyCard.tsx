import { Avatar, Button, Tag } from 'antd';
import { EnvironmentOutlined, TeamOutlined, HeartFilled } from '@ant-design/icons';
import dayjs from 'dayjs';

interface SavedCompanyCardProps {
  company: any;
  savedAt: string;
  onView: () => void;
  onUnsave: () => void;
}

export const SavedCompanyCard = ({ company, savedAt, onView, onUnsave }: SavedCompanyCardProps) => {
  return (
    <div 
      className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_-10px_rgba(79,70,229,0.15)] transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden group cursor-pointer flex flex-col h-full"
      onClick={onView}
    >
      <div
        className="h-40 flex items-center justify-center relative overflow-hidden"
      >
        {/* Animated Banner Background */}
        <div 
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: company.logoUrl
              ? `url(${company.logoUrl})`
              : 'linear-gradient(135deg, #16a34a 0%, #8b5cf6 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: company.logoUrl ? 'blur(8px) brightness(0.6)' : 'none'
          }}
        ></div>
        
        {/* Dark overlay for better text/avatar contrast */}
        {company.logoUrl && <div className="absolute inset-0 bg-black/40"></div>}

        <div className="relative z-10">
          <Avatar 
            size={80} 
            className="shadow-xl border-4 border-white/20 backdrop-blur-sm"
            style={{ 
              background: '#fff', 
              color: '#4338ca', 
              fontSize: 36, 
              fontWeight: 800 
            }}
            src={company.logoUrl}
          >
            {!company.logoUrl && (company.name?.charAt(0))}
          </Avatar>
        </div>

        <Button
          type="primary"
          danger
          shape="circle"
          icon={<HeartFilled className="text-lg" />}
          className="!absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onUnsave();
          }}
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
            Lưu ngày: {dayjs(savedAt).format('DD/MM/YYYY')}
          </div>
          <span className="text-green-600 font-semibold text-sm group-hover:underline">
            Chi tiết &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
