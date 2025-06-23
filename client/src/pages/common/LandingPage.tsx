import Button from '@/components/inputs/Button';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

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
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease-out;
          }
          html {
            scroll-behavior: smooth;
          }
        `,
        }}
      ></style>
      {/* Header */}
      <header className="bg-white shadow-sm pt-4">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="flex justify-between items-center h-16">
            <span className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer select-none">
              <span className="text-2xl">🚌</span>
              <Link to="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer select-none">Basis Transport</Link>
            </span>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-secondary hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-secondary hover:text-primary transition-colors"
              >
                Pricing
              </a>
              <a
                href="#resources"
                className="text-secondary hover:text-primary transition-colors"
              >
                Resources
              </a>
            </nav>
            <Button primary route="/dashboard">
              Get Started
            </Button>
          </section>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-white py-24 lg:py-20">
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-20 animate-on-scroll">
              <h1 className="text-5xl lg:text-7xl font-bold text-primary mb-8 leading-tight">
                Real-time Bus Tracking & Trip Insights
              </h1>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Welcome to Basis Transport — your platform for live bus
                tracking, available seat monitoring, and actionable public
                transport analytics. Empowering commuters and operators with
                real-time data and trip metrics.
              </p>
            </header>

            {/* Laptop Mockup with Green Background */}
            <figure className="relative animate-on-scroll flex items-center justify-center bg-[#8fbc8f] rounded-3xl p-8 lg:p-16 mx-auto max-w-5xl min-h-[340px]">
              <svg
                viewBox="0 0 900 340"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-80 lg:h-[340px] object-contain"
                aria-label="Abstract busy traffic and phone tracking location"
              >
                {/* Abstract road */}
                <rect
                  x="0"
                  y="140"
                  width="900"
                  height="60"
                  rx="30"
                  fill="#d4c5a0"
                  opacity="0.5"
                />
                {/* Moving vehicles (animated) */}
                <g>
                  <rect
                    x="-80"
                    y="155"
                    width="60"
                    height="30"
                    rx="10"
                    fill="#8fbc8f"
                  >
                    <animate
                      attributeName="x"
                      from="-80"
                      to="900"
                      dur="7s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="-200"
                    y="170"
                    width="40"
                    height="20"
                    rx="8"
                    fill="#8d7053"
                  >
                    <animate
                      attributeName="x"
                      from="-200"
                      to="900"
                      dur="9s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="-300"
                    y="150"
                    width="50"
                    height="25"
                    rx="9"
                    fill="#fff"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="x"
                      from="-300"
                      to="900"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </rect>
                  <rect
                    x="-400"
                    y="180"
                    width="70"
                    height="28"
                    rx="12"
                    fill="#8fbc8f"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="x"
                      from="-400"
                      to="900"
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </rect>
                </g>
                {/* Phone device */}
                <g>
                  <rect
                    x="650"
                    y="40"
                    width="120"
                    height="240"
                    rx="32"
                    fill="#fff"
                    stroke="#8d7053"
                    strokeWidth="4"
                  />
                  {/* Phone screen */}
                  <rect
                    x="670"
                    y="60"
                    width="80"
                    height="200"
                    rx="16"
                    fill="#f5f5f5"
                  />
                  {/* Location pin on screen */}
                  <g>
                    <circle cx="710" cy="120" r="16" fill="#8fbc8f" />
                    <circle cx="710" cy="120" r="7" fill="#fff" />
                    <path
                      d="M710 120 Q710 140 720 150 Q730 140 730 120"
                      fill="#8d7053"
                      opacity="0.3"
                    />
                    {/* Animated pulse */}
                    <circle
                      cx="710"
                      cy="120"
                      r="20"
                      fill="#8fbc8f"
                      opacity="0.2"
                    >
                      <animate
                        attributeName="r"
                        values="20;32;20"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.2;0.05;0.2"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                  {/* Route line on screen */}
                  <polyline
                    points="710,120 710,180 740,200"
                    fill="none"
                    stroke="#8fbc8f"
                    strokeWidth="4"
                    strokeDasharray="6 6"
                  />
                  {/* Small moving dot on route */}
                  <circle r="6" fill="#8d7053">
                    <animateMotion
                      dur="2.5s"
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      path="M 710 120 L 710 180 L 740 200"
                    />
                  </circle>
                </g>
                {/* Decorative abstract city/traffic elements */}
                <rect
                  x="100"
                  y="60"
                  width="30"
                  height="80"
                  rx="10"
                  fill="#8d7053"
                  opacity="0.15"
                />
                <rect
                  x="180"
                  y="40"
                  width="24"
                  height="100"
                  rx="8"
                  fill="#8d7053"
                  opacity="0.12"
                />
                <rect
                  x="250"
                  y="80"
                  width="18"
                  height="60"
                  rx="6"
                  fill="#8d7053"
                  opacity="0.10"
                />
                <rect
                  x="320"
                  y="50"
                  width="22"
                  height="90"
                  rx="7"
                  fill="#8d7053"
                  opacity="0.13"
                />
                {/* Analytics/AI abstract dots */}
                <circle cx="800" cy="60" r="8" fill="#8fbc8f" opacity="0.7" />
                <circle cx="850" cy="100" r="6" fill="#8fbc8f" opacity="0.5" />
                <circle cx="820" cy="140" r="5" fill="#8fbc8f" opacity="0.4" />
              </svg>
            </figure>
            <footer className="text-center mt-10 animate-on-scroll">
              <Button
                primary
                route="/dashboard"
                className="px-8 py-4 mt-10 max-w-xs mx-auto"
              >
                Get Started
              </Button>
            </footer>
          </article>
        </section>

        {/* Company Logos */}
        <section className="py-20 bg-gray-50" id="resources">
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex justify-center items-center space-x-12 opacity-60 animate-on-scroll">
              <li className="text-gray-500 font-semibold">
                Rwanda Transport Board
              </li>
              <li className="text-gray-500 font-semibold">
                Kigali Bus Services
              </li>
              <li className="text-gray-500 font-semibold">City Express</li>
              <li className="text-gray-500 font-semibold">Volcano</li>
              <li className="text-gray-500 font-semibold">RFTC</li>
            </ul>
          </article>
        </section>

        {/* Features Section */}
        <section className="py-28 bg-white" id="features">
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-20 animate-on-scroll">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
                The Future of Public Transport
              </h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Powerful features designed to help you track, analyze, and
                optimize public transport operations.
              </p>
            </header>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <li className="text-center animate-on-scroll">
                <figure className="mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">🚌</span>
                </figure>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Live Bus Tracking
                </h3>
                <p className="text-secondary">
                  Track buses in real-time and view their current locations on
                  the map for a seamless commute.
                </p>
              </li>

              <li className="text-center animate-on-scroll">
                <figure className="mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">💺</span>
                </figure>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Available Slots
                </h3>
                <p className="text-secondary">
                  Instantly see available seats for each trip, helping you plan
                  your journey with confidence.
                </p>
              </li>

              <li className="text-center animate-on-scroll">
                <figure className="mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">📊</span>
                </figure>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Trip Metrics
                </h3>
                <p className="text-secondary">
                  Access detailed metrics: number of trips, time spent on trips,
                  and unique public transport users.
                </p>
              </li>

              <li className="text-center animate-on-scroll">
                <figure className="mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">📈</span>
                </figure>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Growth Insights
                </h3>
                <p className="text-secondary">
                  Discover trends and optimize routes with actionable analytics
                  for operators and city planners.
                </p>
              </li>
            </ul>
          </article>
        </section>

        {/* Large Landscape Image */}
        <section className="py-16">
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <figure className="rounded-3xl overflow-hidden animate-on-scroll bg-gradient-to-br from-[#8fbc8f]/30 to-[#d4c5a0]/30 flex items-center justify-center min-h-[384px] lg:min-h-[500px]">
              <svg
                viewBox="0 0 800 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-96 lg:h-[500px] object-cover"
                aria-label="Abstract bus and seats tracking with AI"
              >
                {/* Abstract bus shape */}
                <rect
                  x="120"
                  y="180"
                  rx="32"
                  width="400"
                  height="100"
                  fill="#8fbc8f"
                  opacity="0.85"
                />
                {/* Bus windows */}
                <rect
                  x="160"
                  y="200"
                  width="60"
                  height="40"
                  rx="8"
                  fill="#fff"
                  opacity="0.9"
                />
                <rect
                  x="240"
                  y="200"
                  width="60"
                  height="40"
                  rx="8"
                  fill="#fff"
                  opacity="0.9"
                />
                <rect
                  x="320"
                  y="200"
                  width="60"
                  height="40"
                  rx="8"
                  fill="#fff"
                  opacity="0.9"
                />
                <rect
                  x="400"
                  y="200"
                  width="60"
                  height="40"
                  rx="8"
                  fill="#fff"
                  opacity="0.9"
                />
                {/* Bus wheels */}
                <circle cx="180" cy="300" r="20" fill="#333" opacity="0.7" />
                <circle cx="440" cy="300" r="20" fill="#333" opacity="0.7" />
                {/* Abstract seats (dots) */}
                <g>
                  <circle cx="600" cy="220" r="16" fill="#d4c5a0" />
                  <circle cx="650" cy="220" r="16" fill="#d4c5a0" />
                  <circle cx="700" cy="220" r="16" fill="#d4c5a0" />
                  <circle cx="625" cy="260" r="16" fill="#d4c5a0" />
                  <circle cx="675" cy="260" r="16" fill="#d4c5a0" />
                </g>
                {/* AI/analytics abstract: neural network nodes and lines */}
                <g stroke="#8d7053" strokeWidth="2" opacity="0.7">
                  <circle cx="600" cy="100" r="8" fill="#fff" />
                  <circle cx="700" cy="100" r="8" fill="#fff" />
                  <circle cx="650" cy="60" r="8" fill="#fff" />
                  <line x1="600" y1="100" x2="650" y2="60" />
                  <line x1="650" y1="60" x2="700" y2="100" />
                  <line x1="600" y1="100" x2="700" y2="100" />
                  {/* Dotted connection to seats */}
                  <line
                    x1="650"
                    y1="60"
                    x2="650"
                    y2="220"
                    strokeDasharray="6 6"
                  />
                </g>
                {/* Analytics bars */}
                <rect
                  x="80"
                  y="340"
                  width="30"
                  height="40"
                  rx="6"
                  fill="#8d7053"
                  opacity="0.5"
                />
                <rect
                  x="120"
                  y="360"
                  width="30"
                  height="20"
                  rx="6"
                  fill="#8d7053"
                  opacity="0.3"
                />
                <rect
                  x="160"
                  y="330"
                  width="30"
                  height="50"
                  rx="6"
                  fill="#8d7053"
                  opacity="0.7"
                />
                {/* Decorative abstract lines */}
                <path
                  d="M 100 100 Q 200 50 300 100 T 500 100"
                  stroke="#8fbc8f"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.2"
                />
              </svg>
            </figure>
          </article>
        </section>

        {/* See the Big Picture */}
        <section className="py-28 bg-white">
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <section className="animate-on-scroll">
                <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-8">
                  See the Big Picture
                </h2>
                <p className="text-lg text-secondary mb-10">
                  Transform your city's public transport with comprehensive
                  insights and real-time data.
                </p>

                <ul className="space-y-6">
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 mr-4"></span>
                    <span className="text-secondary">
                      Live dashboards for bus locations and trip status
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 mr-4"></span>
                    <span className="text-secondary">
                      Metrics on trip duration, frequency, and ridership
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 mr-4"></span>
                    <span className="text-secondary">
                      Automated reporting for operators and city officials
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 mr-4"></span>
                    <span className="text-secondary">
                      Seamless experience for commuters and staff
                    </span>
                  </li>
                </ul>

                <Button primary route="/dashboard" className="mt-10">
                  Learn More
                </Button>
              </section>

              <figure className="relative animate-on-scroll">
                <article className="bg-[#d4c5a0] rounded-3xl p-8 lg:p-12">
                  <article className="grid grid-cols-2 gap-4">
                    <article className="bg-white rounded-2xl h-32"></article>
                    <article className="bg-white rounded-2xl h-32"></article>
                    <article className="bg-white rounded-2xl h-32 col-span-2"></article>
                  </article>
                </article>
              </figure>
            </article>
          </article>
        </section>

        {/* Why Choose Basis Transport */}
        <section className="py-28 bg-gray-50" id="pricing">
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-20 animate-on-scroll">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
                Why Choose Basis Transport?
              </h2>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Discover the advantages that make us the preferred choice for
                public transport operators and commuters.
              </p>
            </header>

            <article className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <section className="animate-on-scroll">
                <h3 className="text-xl font-semibold text-primary mb-6">
                  Performance
                </h3>
                <ul className="space-y-3 text-secondary">
                  <li>Lightning fast live updates</li>
                  <li>99.9% uptime guarantee</li>
                  <li>Scalable for city-wide operations</li>
                  <li>Optimized for mobile and desktop</li>
                </ul>
              </section>

              <section className="animate-on-scroll">
                <h3 className="text-xl font-semibold text-primary mb-6">
                  Security
                </h3>
                <ul className="space-y-3 text-secondary">
                  <li>End-to-end encrypted data</li>
                  <li>Compliance with local regulations</li>
                  <li>Regular security audits</li>
                  <li>Advanced threat protection</li>
                </ul>
              </section>

              <section className="animate-on-scroll">
                <h3 className="text-xl font-semibold text-primary mb-6">
                  Support
                </h3>
                <ul className="space-y-3 text-secondary">
                  <li>24/7 customer support</li>
                  <li>Dedicated onboarding for operators</li>
                  <li>Comprehensive documentation</li>
                  <li>Community and city partnerships</li>
                </ul>
              </section>
            </article>

            <footer className="text-center animate-on-scroll">
              <Button primary route="/dashboard" className="px-8 py-4 mt-10 max-w-xs mx-auto">
                Get Started
              </Button>
            </footer>
          </article>
        </section>

        {/* Testimonial */}
        <section className="py-28 bg-white">
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <section className="relative rounded-3xl p-8 lg:p-12 animate-on-scroll overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"></span>
                <span className="absolute inset-0 bg-gradient-to-tr from-[#8fbc8f]/20 to-transparent"></span>
                <span className="relative w-full h-64 lg:h-80 flex items-center justify-center rounded-2xl">
                  <svg
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-32 h-32 lg:w-40 lg:h-40 drop-shadow-lg"
                    aria-label="Abstract user profile icon"
                  >
                    {/* User head */}
                    <circle
                      cx="100"
                      cy="70"
                      r="35"
                      fill="#8fbc8f"
                      opacity="0.9"
                    />
                    {/* User body */}
                    <path
                      d="M 50 120 Q 100 180 150 120"
                      stroke="#8fbc8f"
                      strokeWidth="8"
                      fill="none"
                      opacity="0.9"
                    />
                    {/* Bus icon overlay */}
                    <g transform="translate(85, 85)">
                      <rect
                        x="0"
                        y="0"
                        width="30"
                        height="20"
                        rx="4"
                        fill="#8d7053"
                        opacity="0.8"
                      />
                      <rect
                        x="5"
                        y="5"
                        width="20"
                        height="10"
                        rx="2"
                        fill="#ffffff"
                        opacity="0.9"
                      />
                    </g>
                  </svg>
                </span>
              </section>

              <section className="animate-on-scroll">
                <blockquote className="text-2xl lg:text-3xl font-medium text-primary mb-8 leading-relaxed">
                  "Basis Transport has revolutionized our city's public
                  transport. Real-time tracking and trip analytics have made our
                  operations more efficient and our riders happier."
                </blockquote>
                <footer>
                  <p className="font-semibold text-primary">Sarah Johnson</p>
                  <p className="text-secondary">
                    Operations Manager, Kigali Bus Services
                  </p>
                </footer>
              </section>
            </article>
          </article>
        </section>

        {/* Map Your Success */}
        <section className="py-28 bg-gray-50">
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-20 animate-on-scroll">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
                Map Your Success
              </h2>
              <Button
                primary
                route="/dashboard"
                className="px-8 py-4 mt-10 max-w-xs mx-auto"
              >
                Get Started
              </Button>
            </header>

            <article className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
              <section className="text-center animate-on-scroll">
                <span className="text-6xl font-bold text-primary mb-6 block">
                  01
                </span>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Sign Up
                </h3>
                <p className="text-secondary">
                  Create your account and join the Basis Transport network to
                  access real-time data.
                </p>
              </section>

              <section className="text-center animate-on-scroll">
                <span className="text-6xl font-bold text-primary mb-6 block">
                  02
                </span>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Track & Analyze
                </h3>
                <p className="text-secondary">
                  Track buses, monitor available slots, and analyze trip metrics
                  from your dashboard.
                </p>
              </section>

              <section className="text-center animate-on-scroll">
                <span className="text-6xl font-bold text-primary mb-6 block">
                  03
                </span>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Optimize & Grow
                </h3>
                <p className="text-secondary">
                  Use insights to optimize routes, improve service, and grow
                  your operations.
                </p>
              </section>
            </article>

          </article>
        </section>
      </main>

      {/* Footer / Connect with us */}
      <footer className="py-28 bg-white">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-20 animate-on-scroll">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
              Connect with us
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Ready to transform your city's public transport? Get in touch with
              our team today.
            </p>
          </header>

          <section className="max-w-2xl mx-auto animate-on-scroll">
            <form className="space-y-8">
              <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <label className="space-y-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </label>
                <label className="space-y-2">
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </label>
              </fieldset>

              <label className="block mb-8">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </label>

              <label className="block mb-8">
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                ></textarea>
              </label>

              <footer className="text-center">
                <Button type="submit" primary className="px-8 py-4">
                  Send Message
                </Button>
              </footer>
            </form>
          </section>

          <footer className="mt-20 pt-8 border-t border-gray-200">
            <section className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">
                Basis Transport
              </span>
              <nav className="flex space-x-6 text-secondary">
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </nav>
            </section>
          </footer>
        </section>
      </footer>
    </main>
  );
};

export default LandingPage;
