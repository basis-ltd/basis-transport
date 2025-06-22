import Button from '@/components/inputs/Button';
import { useEffect, useRef } from 'react';

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
    <div className="min-h-screen bg-white">
      <style dangerouslySetInnerHTML={{
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
        `
      }}></style>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-primary">Arva</div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-secondary hover:text-primary transition-colors">Products</a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">Solutions</a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">Resources</a>
            </div>
            <Button primary>Get Started</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <h1 className="text-5xl lg:text-7xl font-bold text-primary mb-8 leading-tight">
              Browse everything.
            </h1>
          </div>
          
          {/* Laptop Mockup with Green Background */}
          <div className="relative animate-on-scroll">
            <div className="bg-[#8fbc8f] rounded-3xl p-8 lg:p-16 mx-auto max-w-5xl">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                  alt="Laptop displaying dashboard"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-12 opacity-60 animate-on-scroll">
            <div className="text-gray-500 font-semibold">Dropbox</div>
            <div className="text-gray-500 font-semibold">Webflow</div>
            <div className="text-gray-500 font-semibold">Intercom</div>
            <div className="text-gray-500 font-semibold">Figma</div>
            <div className="text-gray-500 font-semibold">Notion</div>
          </div>
        </div>
      </section>

      {/* We've cracked the code */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
              We've cracked the code.
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Powerful features designed to help you succeed in every aspect of your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="text-center animate-on-scroll">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-6 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Smart Analytics</h3>
              <p className="text-secondary">
                Get deep insights into your business performance with our advanced analytics dashboard.
              </p>
            </div>
            
            <div className="text-center animate-on-scroll">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-6 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Real-time Sync</h3>
              <p className="text-secondary">
                Keep your data synchronized across all platforms in real-time for seamless operations.
              </p>
            </div>
            
            <div className="text-center animate-on-scroll">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-6 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Secure Platform</h3>
              <p className="text-secondary">
                Enterprise-grade security ensures your data is protected with the highest standards.
              </p>
            </div>
            
            <div className="text-center animate-on-scroll">
              <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-6 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Easy Integration</h3>
              <p className="text-secondary">
                Connect with your favorite tools and services with our simple integration process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Large Landscape Image */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden animate-on-scroll">
            <img 
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Mountain landscape"
              className="w-full h-96 lg:h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* See the Big Picture */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-on-scroll">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-8">
                See the Big Picture
              </h2>
              <p className="text-lg text-secondary mb-10">
                Transform your business with comprehensive insights and powerful tools designed for growth.
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 mr-4"></div>
                  <span className="text-secondary">Real-time data visualization with interactive dashboards</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 mr-4"></div>
                  <span className="text-secondary">Advanced reporting tools for better decision making</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 mr-4"></div>
                  <span className="text-secondary">Automated workflows that save time and reduce errors</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1 mr-4"></div>
                  <span className="text-secondary">Seamless collaboration tools for your entire team</span>
                </li>
              </ul>
              
              <Button primary className="mt-10">
                Learn More
              </Button>
            </div>
            
            <div className="relative animate-on-scroll">
              <div className="bg-[#d4c5a0] rounded-3xl p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl h-32"></div>
                  <div className="bg-white rounded-2xl h-32"></div>
                  <div className="bg-white rounded-2xl h-32 col-span-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Arva */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
              Why Choose Arva?
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Discover the advantages that make us the preferred choice for businesses worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="animate-on-scroll">
              <h3 className="text-xl font-semibold text-primary mb-6">Performance</h3>
              <ul className="space-y-3 text-secondary">
                <li>Lightning fast loading</li>
                <li>99.9% uptime guarantee</li>
                <li>Global CDN network</li>
                <li>Optimized for scale</li>
              </ul>
            </div>
            
            <div className="animate-on-scroll">
              <h3 className="text-xl font-semibold text-primary mb-6">Security</h3>
              <ul className="space-y-3 text-secondary">
                <li>End-to-end encryption</li>
                <li>SOC 2 compliance</li>
                <li>Regular security audits</li>
                <li>Advanced threat protection</li>
              </ul>
            </div>
            
            <div className="animate-on-scroll">
              <h3 className="text-xl font-semibold text-primary mb-6">Support</h3>
              <ul className="space-y-3 text-secondary">
                <li>24/7 customer support</li>
                <li>Dedicated account manager</li>
                <li>Comprehensive documentation</li>
                <li>Community forums</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center animate-on-scroll">
            <Button primary>
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="bg-[#8d7053] rounded-3xl p-8 lg:p-12 animate-on-scroll">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                alt="Professional headshot"
                className="w-full h-64 lg:h-80 object-cover rounded-2xl"
              />
            </div>
            
            <div className="animate-on-scroll">
              <blockquote className="text-2xl lg:text-3xl font-medium text-primary mb-8 leading-relaxed">
                "I was skeptical, but Arva has completely transformed the way I manage my business. The data visualizations are so clear and easy to use. I can't imagine running my company without it."
              </blockquote>
              <div>
                <div className="font-semibold text-primary">Sarah Johnson</div>
                <div className="text-secondary">CEO, TechStart Inc.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Your Success */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
              Map Your Success
            </h2>
            <Button primary>
              Get Started
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="text-center animate-on-scroll">
              <div className="text-6xl font-bold text-primary mb-6">01</div>
              <h3 className="text-xl font-semibold text-primary mb-4">Get Started</h3>
              <p className="text-secondary">
                Sign up for your account and complete the quick onboarding process to get started.
              </p>
            </div>
            
            <div className="text-center animate-on-scroll">
              <div className="text-6xl font-bold text-primary mb-6">02</div>
              <h3 className="text-xl font-semibold text-primary mb-4">Connect & Configure</h3>
              <p className="text-secondary">
                Connect your existing tools and configure your workspace to match your workflow.
              </p>
            </div>
            
            <div className="text-center animate-on-scroll">
              <div className="text-6xl font-bold text-primary mb-6">03</div>
              <h3 className="text-xl font-semibold text-primary mb-4">Scale & Succeed</h3>
              <p className="text-secondary">
                Watch your business grow with powerful insights and automated processes.
              </p>
            </div>
          </div>
          
          <div className="rounded-3xl overflow-hidden animate-on-scroll">
            <img 
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
              alt="Aerial view of winding road through landscape"
              className="w-full h-64 lg:h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Footer / Connect with us */}
      <footer className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
              Connect with us
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Ready to transform your business? Get in touch with our team today.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto animate-on-scroll">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                ></textarea>
              </div>
              
              <div className="text-center">
                <Button type="submit" primary className="px-8 py-4">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mt-20 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-primary">Arva</div>
              <div className="flex space-x-6 text-secondary">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
