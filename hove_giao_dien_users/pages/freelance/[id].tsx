import { useRouter } from 'next/router';
import { FreelanceDetailFeature } from '@/features/freelance/FreelanceDetailFeature';

const FreelanceDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return <FreelanceDetailFeature projectId={id as string} />;
};

export default FreelanceDetailPage;
