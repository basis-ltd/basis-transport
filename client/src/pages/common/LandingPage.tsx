import { useGetPublicLandingStatsQuery } from '@/api/queries/apiQuerySlice';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Seo } from '@/components/seo';
import { absoluteUrl } from '@/constants/seo.constants';
import PublicFooter from '@/containers/public/PublicFooter';
import PublicLayout from '@/containers/public/PublicLayout';
import PublicNavbar from '@/containers/public/PublicNavbar';
import LandingBenefitsSection from './components/landing/LandingBenefitsSection';
import LandingFeaturesSection from './components/landing/LandingFeaturesSection';
import LandingFinalCtaSection from './components/landing/LandingFinalCtaSection';
import LandingHeroSection from './components/landing/LandingHeroSection';
import LandingHowItWorksSection from './components/landing/LandingHowItWorksSection';
import LandingProblemReliefSection from './components/landing/LandingProblemReliefSection';
import LandingProductPreviewSection from './components/landing/LandingProductPreviewSection';
import LandingTestimonialsSection from './components/landing/LandingTestimonialsSection';

const LandingPage = () => {
  const { data: landingStats, isLoading, isError } =
    useGetPublicLandingStatsQuery();

  const { commutesValue, usersValue } = useMemo(() => {
    if (isLoading || isError || !landingStats) {
      return { commutesValue: '—', usersValue: '—' };
    }
    return {
      commutesValue: landingStats.commutes.toLocaleString() + '+',
      usersValue: `${landingStats.users.toLocaleString()}+`,
    };
  }, [landingStats, isLoading, isError]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollToHowItWorks = useCallback(() => {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((element) => observerRef.current?.observe(element));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <>
      <Seo
        title="Basis Transport | Know Your Bus. Trust Your Commute."
        description="Get real-time bus arrival times, see available seats, and travel with confidence. Free app for everyday commuters. No surprises. No stress."
        canonicalPath="/"
        author="Basis Transport"
        keywords="bus tracker, real-time arrivals, bus times, seat availability, commute app, public transport, travel app"
        contentLanguage="en"
        ogDescription="Get real-time bus arrival times and travel with confidence. Free for everyday commuters."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Basis Transport',
          url: absoluteUrl('/'),
          description:
            'A free app that helps you know when your bus arrives, see available seats, and travel with confidence.',
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes subtle-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
            .animate-on-scroll { opacity: 0; transform: translateY(30px); }
            .subtle-float { animation: subtle-float 3s ease-in-out infinite; }
            html { scroll-behavior: smooth; }
            .text-balance { text-wrap: balance; }
          `,
        }}
      />

      <PublicLayout>
        <PublicNavbar />
        <article>
          <LandingHeroSection
            onLearnMore={scrollToHowItWorks}
            commutesValue={commutesValue}
            usersValue={usersValue}
          />
          <LandingProblemReliefSection />
          <LandingBenefitsSection />
          <LandingFeaturesSection />
          <LandingHowItWorksSection />
          <LandingProductPreviewSection />
          <LandingTestimonialsSection />
          <LandingFinalCtaSection onLearnMore={scrollToHowItWorks} />
        </article>
        <PublicFooter />
      </PublicLayout>
    </>
  );
};

export default LandingPage;
