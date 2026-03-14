import { HeroSection } from './components/HeroSection';
import { IntroSection } from './components/IntroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { CtaSection } from './components/CtaSection';

export const HomeFeature = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <IntroSection />
      <FeaturesSection />
      <CtaSection />
    </div>
  );
};

