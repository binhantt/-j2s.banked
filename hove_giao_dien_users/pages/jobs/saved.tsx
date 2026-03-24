import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SavedJobsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/saved-items');
  }, [router]);

  return null;
}
