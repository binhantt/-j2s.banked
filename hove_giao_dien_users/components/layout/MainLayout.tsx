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
    <Layout style={{ minHeight: '100vh', background: '#f3f6fb' }}>
      <Navbar />
      <Content className={`pt-[72px] ${className}`}>
        {fullWidth ? (
          children
        ) : (
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
            {children}
          </div>
        )}
      </Content>
      <Footer />
    </Layout>
  );
};
