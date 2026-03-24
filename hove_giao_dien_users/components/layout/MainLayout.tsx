import { Layout } from 'antd';
import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const { Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const MainLayout = ({ children, className = '', fullWidth = false }: MainLayoutProps) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <Content className={`pt-[80px] ${className}`}>
        {fullWidth ? (
          children
        ) : (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
            {children}
          </div>
        )}
      </Content>
      <Footer />
    </Layout>
  );
};
