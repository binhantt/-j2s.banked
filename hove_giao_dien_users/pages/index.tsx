import { HomeFeature } from '@/features/home';
import { MainLayout } from '@/components/layout/MainLayout';
import Head from 'next/head';

const Home = () => {
  return (
    <MainLayout>
      <Head>
        <title>Hove - Nền tảng Tìm việc làm & Tuyển dụng hàng đầu Việt Nam</title>
        <meta name="description" content="Tìm kiếm hàng ngàn cơ hội việc làm hấp dẫn và kết nối với các nhà tuyển dụng hàng đầu tại Hove. Tuyển dụng nhanh chóng, tìm việc hiệu quả." />
      </Head>
      <HomeFeature />
    </MainLayout>
  );
};

export default Home;
