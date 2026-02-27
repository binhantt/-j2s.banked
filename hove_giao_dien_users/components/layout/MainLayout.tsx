import { Layout } from 'antd';
import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LAYOUT } from '@/lib/constants';

const { Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const MainLayout = ({ children, className = '', fullWidth = false }: MainLayoutProps) => {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className={`pt-16 ${className}`}>
        {fullWidth ? (
          children
        ) : (
          <div className={`${LAYOUT.container} ${LAYOUT.paddingY}`}>
            {children}
          </div>
        )}
      </Content>
      <Footer />
    </Layout>
  );
};
