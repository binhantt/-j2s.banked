import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CompanyBlogsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new blogs index page
    router.replace('/company/blogs');
  }, [router]);

  return null;
}