import { Layout } from 'antd';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      
      <Content className="mt-16 min-h-[calc(100vh-64px)]">
        <div className="w-full">
          {children}
        </div>
        <Footer />
      </Content>
    </Layout>
  );
};
