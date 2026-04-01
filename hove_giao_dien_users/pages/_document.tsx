import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import type { DocumentContext } from 'next/document';

const SITE_NAME = 'Hove - Nền tảng tuyển dụng & việc làm trực tuyến Việt Nam';
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || 'https://hove.vn';
const SITE_DESC = 'Hove - Nền tảng kết nối ứng viên tài năng, freelancer chuyên nghiệp và nhà tuyển dụng uy tín hàng đầu Việt Nam. Tìm việc nhanh, tuyển dụng hiệu quả ngay hôm nay.';
const SITE_IMAGE = `${SITE_URL}/og-image.png`;

const MyDocument = () => (
  <Html lang="vi">
    <Head>
      {/* === SEO Meta Tags === */}
      <meta name="description"        content={SITE_DESC} />
      <meta name="keywords"            content="tuyển dụng, việc làm, freelancer, tìm việc, nhà tuyển dụng, Hove" />
      <meta name="author"              content="Hove" />
      <meta name="robots"              content="index, follow" />
      <meta name="googlebot"            content="index, follow" />

      {/* === Open Graph (Facebook / Zalo sharing) === */}
      <meta property="og:type"         content="website" />
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta property="og:title"         content={SITE_NAME} />
      <meta property="og:description"   content={SITE_DESC} />
      <meta property="og:url"           content={SITE_URL} />
      <meta property="og:image"         content={SITE_IMAGE} />
      <meta property="og:image:width"   content="1200" />
      <meta property="og:image:height"  content="630" />
      <meta property="og:locale"       content="vi_VN" />

      {/* === Twitter Card === */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={SITE_NAME} />
      <meta name="twitter:description" content={SITE_DESC} />
      <meta name="twitter:image"        content={SITE_IMAGE} />

      {/* === Favicon / Icons === */}
      <link rel="icon"       href="/favicon.ico"          sizes="any"    type="image/x-icon" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />

      {/* === Canonical === */}
      <link rel="canonical" href={SITE_URL} />

      {/* === Preconnect for performance === */}
      <link rel="preconnect" href="https://fonts.googleapis.com"     />
      <link rel="preconnect" href="https://fonts.gstatic.com"  crossOrigin="anonymous" />
      <link rel="preconnect" href="https://accounts.google.com"       />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const cache = createCache();
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => (
        <StyleProvider cache={cache}>
          <App {...props} />
        </StyleProvider>
      ),
    });

  const initialProps = await Document.getInitialProps(ctx);
  const style = extractStyle(cache, true);
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    ),
  };
};

export default MyDocument;
