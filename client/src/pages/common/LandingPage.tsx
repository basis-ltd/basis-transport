import Button from '@/components/inputs/Button';
import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as THREE from 'three';

// Simplified color palette
const Colors = {
  primary: '#283618',        // Deep forest green
  primaryLight: '#4a6741',   // Lighter sage
  primaryLighter: '#6b8563', // Even lighter sage
  neutral: '#2d2d2d',        // Near black
  neutralLight: '#666666',   // Medium gray
  neutralLighter: '#999999', // Light gray
  bg: '#fafaf8',            // Off-white
  bgAlt: '#f3f3f1',         // Slightly darker off-white
  white: '#ffffff',
};

// Three.js Passenger Journey Visualization
const PassengerFlowCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const sceneRef = useRef<THREE.Scene | undefined>(undefined);
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);

  const initThree = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 25;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Create gentle journey visualization - soft nodes representing daily commuters
    const nodeCount = 80;
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);

    const primaryColor = new THREE.Color('#283618');
    const lightColor = new THREE.Color('#6b8563');

    for (let i = 0; i < nodeCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      const colorChoice = Math.random();
      const chosenColor = colorChoice < 0.6 ? primaryColor : lightColor;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Soft connecting lines - representing journeys
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x283618,
      transparent: true,
      opacity: 0.08,
    });

    const linePositions: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = Math.sqrt(
          Math.pow(positions[i * 3] - positions[j * 3], 2) +
          Math.pow(positions[i * 3 + 1] - positions[j * 3 + 1], 2) +
          Math.pow(positions[i * 3 + 2] - positions[j * 3 + 2], 2)
        );
        if (dist < 6) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Animation - gentle and calming
    let time = 0;
    const animate = () => {
      time += 0.0015;

      particles.rotation.y = time * 0.08;
      particles.rotation.x = Math.sin(time * 0.3) * 0.05;
      lines.rotation.y = time * 0.08;
      lines.rotation.x = Math.sin(time * 0.3) * 0.05;

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const newWidth = canvasRef.current.clientWidth;
      const newHeight = canvasRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, []);

  useEffect(() => {
    const cleanup = initThree();
    return cleanup;
  }, [initThree]);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'block',
        opacity: 0.9
      }}
      aria-hidden="true"
    />
  );
};

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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>Basis Transport | Know Your Bus. Trust Your Commute.</title>
        <meta name="description" content="Get real-time bus arrival times, see available seats, and travel with confidence. Free app for everyday commuters. No surprises. No stress." />
        <meta name="keywords" content="bus tracker, real-time arrivals, bus times, seat availability, commute app, public transport, travel app" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Basis Transport" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta property="og:title" content="Basis Transport | Know Your Bus. Trust Your Commute." />
        <meta property="og:description" content="Get real-time bus arrival times and travel with confidence. Free for everyday commuters." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://transport.basis.rw/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Basis Transport | Know Your Bus. Trust Your Commute." />
        <meta name="twitter:description" content="Get real-time bus arrival times and travel with confidence. Free for everyday commuters." />
        <link rel="canonical" href="https://transport.basis.rw/" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Basis Transport",
            "url": "https://transport.basis.rw/",
            "description": "A free app that helps you know when your bus arrives, see available seats, and travel with confidence."
          }
        `}</script>
      </Helmet>

      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      <main className="min-h-screen" style={{ backgroundColor: Colors.bg }}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b" style={{ backgroundColor: `${Colors.bg}/80`, borderColor: `${Colors.primary}15` }}>
          <nav className="max-w-6xl mx-auto px-6 lg:px-8">
            <section className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center gap-2 group">
                <figure className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: Colors.primary }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={Colors.white} strokeWidth="2" strokeLinecap="round"/>
                    <rect x="4" y="6" width="16" height="12" rx="2" stroke={Colors.white} strokeWidth="2"/>
                    <circle cx="8" cy="20" r="2" fill={Colors.white}/>
                    <circle cx="16" cy="20" r="2" fill={Colors.white}/>
                  </svg>
                </figure>
                <span className="text-base font-medium" style={{ color: Colors.primary }}>Basis</span>
              </Link>

              <Button primary route="/dashboard" className="!px-6 !py-2 !rounded-lg !text-sm !font-medium">
                Open App
              </Button>
            </section>
          </nav>
        </header>

        <article>
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            {/* Three.js Background */}
            <figure className="absolute inset-0 z-0" aria-hidden="true">
              <PassengerFlowCanvas />
            </figure>

            {/* Gradient overlays - subtle */}
            <aside className="absolute inset-0 bg-gradient-to-b from-[#fafaf8]/95 via-transparent to-[#fafaf8]/95 z-10 pointer-events-none" aria-hidden="true" />
            <aside className="absolute inset-0 bg-gradient-to-r from-[#fafaf8]/85 via-transparent to-[#fafaf8]/85 z-10 pointer-events-none" aria-hidden="true" />

            <article className="relative z-20 max-w-4xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
              <header className="animate-on-scroll">
                <h1 className="text-5xl lg:text-6xl leading-tight mb-6 font-light text-balance" style={{ color: Colors.primary }}>
                  Never wonder when your bus is coming.
                </h1>

                <p className="text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl" style={{ color: Colors.neutralLight }}>
                  Real-time arrivals, available seats, and the confidence to leave home exactly on time. It's free and takes 30 seconds to set up.
                </p>

                <nav className="flex flex-col sm:flex-row gap-4">
                  <Button primary route="/dashboard" className="!px-8 !py-4 !rounded-lg !text-base !font-medium inline-flex items-center gap-3">
                    Create Free Account
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                  <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-current transition-colors" style={{ color: Colors.primary, borderColor: Colors.primary }}>
                    See how it works
                  </a>
                </nav>

                <p className="mt-8 text-sm" style={{ color: Colors.neutralLight }}>
                  Free to use. No credit card needed.
                </p>
              </header>

              {/* Live Stats */}
              <aside className="mt-20 animate-on-scroll grid grid-cols-3 gap-8 lg:gap-12" style={{ animationDelay: '0.2s' }}>
                <div className="text-center">
                  <data className="block text-3xl lg:text-4xl font-light mb-2" style={{ color: Colors.primary }}>2.3M</data>
                  <span className="text-sm" style={{ color: Colors.neutralLight }}>Daily commuters</span>
                </div>
                <div className="text-center">
                  <data className="block text-3xl lg:text-4xl font-light mb-2" style={{ color: Colors.primary }}>15 mins</data>
                  <span className="text-sm" style={{ color: Colors.neutralLight }}>Avg time saved</span>
                </div>
                <div className="text-center">
                  <data className="block text-3xl lg:text-4xl font-light mb-2" style={{ color: Colors.primary }}>98%</data>
                  <span className="text-sm" style={{ color: Colors.neutralLight }}>Happy users</span>
                </div>
              </aside>
            </article>
          </section>

          {/* Problem → Relief Section */}
          <section className="py-24" style={{ backgroundColor: Colors.white }}>
            <article className="max-w-4xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
                <aside className="animate-on-scroll">
                  <h2 className="text-3xl lg:text-4xl leading-tight mb-6 font-light" style={{ color: Colors.primary }}>
                    The stress of not knowing
                  </h2>
                  <p className="text-base leading-relaxed mb-6" style={{ color: Colors.neutralLight }}>
                    You check the time. You check the street. Is your bus here? Did you miss it? Will you be late? Every commute is a guess, and guessing makes you anxious.
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: Colors.neutralLight }}>
                    You wonder if there's a seat. You stress about being packed in. You don't know if you should wait or walk to the next stop.
                  </p>
                </aside>

                <aside className="animate-on-scroll" style={{ animationDelay: '0.15s' }}>
                  <h2 className="text-3xl lg:text-4xl leading-tight mb-6 font-light" style={{ color: Colors.primary }}>
                    The calm of knowing
                  </h2>
                  <p className="text-base leading-relaxed mb-6" style={{ color: Colors.neutralLight }}>
                    Open Basis. See your bus coming in 7 minutes. You know exactly when to leave. No stress. No surprises.
                  </p>
                  <p className="text-base leading-relaxed" style={{ color: Colors.neutralLight }}>
                    Check how many seats are open. Travel when you're ready. That 15 minutes you save every day? That's time for coffee, or just breathing.
                  </p>
                </aside>
              </div>
            </article>
          </section>

          {/* Why People Use Basis Daily */}
          <section className="py-24" style={{ backgroundColor: Colors.bgAlt }}>
            <article className="max-w-4xl mx-auto px-6 lg:px-8">
              <header className="text-center mb-16 animate-on-scroll">
                <h2 className="text-4xl lg:text-5xl leading-tight mb-6 font-light" style={{ color: Colors.primary }}>
                  Why commuters keep using Basis
                </h2>
                <p className="text-lg" style={{ color: Colors.neutralLight }}>
                  It's not about fancy features. It's about how you feel.
                </p>
              </header>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Benefit 1 */}
                <li className="animate-on-scroll p-8 rounded-xl" style={{ backgroundColor: Colors.white }}>
                  <h3 className="text-xl font-medium mb-3" style={{ color: Colors.primary }}>
                    Confidence before you leave
                  </h3>
                  <p style={{ color: Colors.neutralLight }}>
                    You know exactly when your bus arrives. No second-guessing. No checking twice. Just leave home with peace of mind.
                  </p>
                </li>

                {/* Benefit 2 */}
                <li className="animate-on-scroll p-8 rounded-xl" style={{ backgroundColor: Colors.white, animationDelay: '0.1s' }}>
                  <h3 className="text-xl font-medium mb-3" style={{ color: Colors.primary }}>
                    Saved time every single day
                  </h3>
                  <p style={{ color: Colors.neutralLight }}>
                    No more waiting around. No more showing up early "just in case." You arrive at exactly the right moment.
                  </p>
                </li>

                {/* Benefit 3 */}
                <li className="animate-on-scroll p-8 rounded-xl" style={{ backgroundColor: Colors.white, animationDelay: '0.2s' }}>
                  <h3 className="text-xl font-medium mb-3" style={{ color: Colors.primary }}>
                    Know you'll have a seat
                  </h3>
                  <p style={{ color: Colors.neutralLight }}>
                    See if your bus is crowded before you board. Choose to wait for a less busy one, or pack light and stand comfortably.
                  </p>
                </li>

                {/* Benefit 4 */}
                <li className="animate-on-scroll p-8 rounded-xl" style={{ backgroundColor: Colors.white, animationDelay: '0.3s' }}>
                  <h3 className="text-xl font-medium mb-3" style={{ color: Colors.primary }}>
                    In control of your commute
                  </h3>
                  <p style={{ color: Colors.neutralLight }}>
                    No more hoping. No more guessing. You decide when to leave, when to travel, when to relax. That's control.
                  </p>
                </li>
              </ul>
            </article>
          </section>

          {/* Simple Feature Overview */}
          <section className="py-24" style={{ backgroundColor: Colors.white }}>
            <article className="max-w-4xl mx-auto px-6 lg:px-8">
              <header className="text-center mb-16 animate-on-scroll">
                <h2 className="text-4xl lg:text-5xl leading-tight mb-6 font-light" style={{ color: Colors.primary }}>
                  Simple tools that actually help
                </h2>
              </header>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Feature 1 */}
                <li className="animate-on-scroll">
                  <div className="flex gap-5 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: Colors.primary }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="1"/>
                        <path d="M12 1v6m0 6v6"/>
                        <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24"/>
                        <path d="M1 12h6m6 0h6"/>
                        <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2" style={{ color: Colors.primary }}>Real-time arrivals</h3>
                      <p style={{ color: Colors.neutralLight }}>See exactly when your bus will arrive. Updated every few seconds so you're never guessing.</p>
                    </div>
                  </div>
                </li>

                {/* Feature 2 */}
                <li className="animate-on-scroll" style={{ animationDelay: '0.1s' }}>
                  <div className="flex gap-5 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: Colors.primary }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2" aria-hidden="true">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2" style={{ color: Colors.primary }}>Available seats</h3>
                      <p style={{ color: Colors.neutralLight }}>Know how busy your bus is before you board. Travel comfortably or wait for the next one.</p>
                    </div>
                  </div>
                </li>

                {/* Feature 3 */}
                <li className="animate-on-scroll" style={{ animationDelay: '0.2s' }}>
                  <div className="flex gap-5 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: Colors.primary }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2" aria-hidden="true">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2" style={{ color: Colors.primary }}>Trip history</h3>
                      <p style={{ color: Colors.neutralLight }}>See your routes and favorite stops. Quickly book the same commute over and over.</p>
                    </div>
                  </div>
                </li>

                {/* Feature 4 */}
                <li className="animate-on-scroll" style={{ animationDelay: '0.3s' }}>
                  <div className="flex gap-5 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: Colors.primary }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2" aria-hidden="true">
                        <path d="M18 9l-6 6-6-6"/>
                        <path d="M18 5l-6 6-6-6"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2" style={{ color: Colors.primary }}>Smart alerts</h3>
                      <p style={{ color: Colors.neutralLight }}>Get notified before your bus arrives. Never miss a ride again.</p>
                    </div>
                  </div>
                </li>
              </ul>
            </article>
          </section>

          {/* How It Works */}
          <section className="py-24" style={{ backgroundColor: Colors.bgAlt }} id="how-it-works">
            <article className="max-w-4xl mx-auto px-6 lg:px-8">
              <header className="text-center mb-16 animate-on-scroll">
                <h2 className="text-4xl lg:text-5xl leading-tight mb-6 font-light" style={{ color: Colors.primary }}>
                  Three steps to your first confident commute
                </h2>
              </header>

              <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <li className="animate-on-scroll">
                  <article className="text-center">
                    <figure className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center font-light text-xl" style={{ backgroundColor: Colors.primary, color: Colors.white }}>
                      1
                    </figure>
                    <h3 className="text-xl font-medium mb-3" style={{ color: Colors.primary }}>
                      Create your account
                    </h3>
                    <p style={{ color: Colors.neutralLight }}>
                      Free signup. No credit card. Just your phone number and you're in.
                    </p>
                  </article>
                </li>

                <li className="animate-on-scroll" style={{ animationDelay: '0.15s' }}>
                  <article className="text-center">
                    <figure className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center font-light text-xl" style={{ backgroundColor: Colors.primary, color: Colors.white }}>
                      2
                    </figure>
                    <h3 className="text-xl font-medium mb-3" style={{ color: Colors.primary }}>
                      Pick your stop
                    </h3>
                    <p style={{ color: Colors.neutralLight }}>
                      Search for your bus stop. Save your favorites for next time.
                    </p>
                  </article>
                </li>

                <li className="animate-on-scroll" style={{ animationDelay: '0.3s' }}>
                  <article className="text-center">
                    <figure className="w-16 h-16 mx-auto mb-6 rounded-lg flex items-center justify-center font-light text-xl" style={{ backgroundColor: Colors.primary, color: Colors.white }}>
                      3
                    </figure>
                    <h3 className="text-xl font-medium mb-3" style={{ color: Colors.primary }}>
                      Travel with confidence
                    </h3>
                    <p style={{ color: Colors.neutralLight }}>
                      See your bus arriving. Know there's a seat. Leave home exactly on time.
                    </p>
                  </article>
                </li>
              </ol>
            </article>
          </section>

          {/* Product Experience Preview */}
          <section className="py-24" style={{ backgroundColor: Colors.white }}>
            <article className="max-w-4xl mx-auto px-6 lg:px-8">
              <header className="text-center mb-16 animate-on-scroll">
                <h2 className="text-4xl lg:text-5xl leading-tight mb-6 font-light" style={{ color: Colors.primary }}>
                  Designed to be simple
                </h2>
                <p style={{ color: Colors.neutralLight }}>
                  No confusing menus. No unnecessary steps. Just the information you need.
                </p>
              </header>

              <figure className="animate-on-scroll rounded-2xl overflow-hidden border-2" style={{ borderColor: `${Colors.primary}20` }}>
                <article style={{ backgroundColor: Colors.bgAlt }}>
                  {/* Simulated app interface */}
                  <section className="p-6">
                    {/* App header */}
                    <header className="mb-8">
                      <p className="text-xs mb-4" style={{ color: Colors.neutralLight }}>Your Next Bus</p>
                      <div className="rounded-xl p-6" style={{ backgroundColor: Colors.white }}>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm" style={{ color: Colors.neutralLight }}>Route 47 → Downtown</p>
                            <p className="text-3xl font-light mt-1" style={{ color: Colors.primary }}>Arrives in 7 min</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium" style={{ color: '#16a34a' }}>On time</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <p className="text-xs mb-1" style={{ color: Colors.neutralLight }}>Available seats</p>
                            <p className="text-2xl font-light" style={{ color: Colors.primary }}>12 left</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs mb-1" style={{ color: Colors.neutralLight }}>Next buses</p>
                            <p className="text-sm mt-1" style={{ color: Colors.neutralLight }}>+15, +28 min</p>
                          </div>
                        </div>
                      </div>
                    </header>

                    {/* Stop favorites */}
                    <section>
                      <p className="text-xs mb-4 font-medium" style={{ color: Colors.neutralLight }}>YOUR STOPS</p>
                      <ul className="space-y-3">
                        <li className="rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: Colors.white }}>
                          <p className="font-medium" style={{ color: Colors.primary }}>Home (Downtown)</p>
                          <p className="text-xs mt-1" style={{ color: Colors.neutralLight }}>4 routes</p>
                        </li>
                        <li className="rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: Colors.white }}>
                          <p className="font-medium" style={{ color: Colors.primary }}>Work (Central Station)</p>
                          <p className="text-xs mt-1" style={{ color: Colors.neutralLight }}>3 routes</p>
                        </li>
                      </ul>
                    </section>
                  </section>
                </article>
              </figure>

              <footer className="text-center mt-12 animate-on-scroll">
                <p style={{ color: Colors.neutralLight }}>
                  That's it. No clutter. No distractions. Just the bus information that matters to you.
                </p>
              </footer>
            </article>
          </section>

          {/* Social Proof - Real Stories */}
          <section className="py-24" style={{ backgroundColor: Colors.bgAlt }}>
            <article className="max-w-4xl mx-auto px-6 lg:px-8">
              <header className="text-center mb-16 animate-on-scroll">
                <h2 className="text-4xl lg:text-5xl leading-tight mb-6 font-light" style={{ color: Colors.primary }}>
                  Real people. Real time saved.
                </h2>
              </header>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <li className="animate-on-scroll rounded-xl p-8" style={{ backgroundColor: Colors.white }}>
                  <blockquote>
                    <p className="text-lg leading-relaxed mb-6" style={{ color: Colors.neutral }}>
                      "I used to wake up 30 minutes early just to be safe. Now I know exactly when my bus comes. That's 2.5 hours a week back."
                    </p>
                    <footer>
                      <cite className="not-italic font-medium" style={{ color: Colors.primary }}>— James, student</cite>
                    </footer>
                  </blockquote>
                </li>

                <li className="animate-on-scroll rounded-xl p-8" style={{ backgroundColor: Colors.white, animationDelay: '0.1s' }}>
                  <blockquote>
                    <p className="text-lg leading-relaxed mb-6" style={{ color: Colors.neutral }}>
                      "Checking seat availability changed everything. No more being packed in like sardines. I actually look forward to my commute now."
                    </p>
                    <footer>
                      <cite className="not-italic font-medium" style={{ color: Colors.primary }}>— Sarah, professional</cite>
                    </footer>
                  </blockquote>
                </li>
              </ul>
            </article>
          </section>

          {/* Final CTA */}
          <section className="py-24" style={{ backgroundColor: Colors.white }}>
            <article className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
              <header className="animate-on-scroll">
                <h2 className="text-4xl lg:text-5xl leading-tight mb-6 font-light" style={{ color: Colors.primary }}>
                  Done stressing about your commute?
                </h2>
                <p className="text-lg mb-10" style={{ color: Colors.neutralLight }}>
                  Create your free account and start your confident commute today.
                </p>
                <nav className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button primary route="/dashboard" className="!px-10 !py-4 !rounded-lg !text-base !font-medium">
                    Create Free Account
                  </Button>
                  <a href="/" className="inline-flex items-center justify-center px-10 py-4 rounded-lg transition-colors" style={{ color: Colors.primary, backgroundColor: `${Colors.primary}10` }}>
                    Learn more
                  </a>
                </nav>
              </header>
            </article>
          </section>
        </article>

        {/* Footer */}
        <footer className="py-16 border-t" style={{ borderColor: `${Colors.primary}15` }}>
          <section className="max-w-6xl mx-auto px-6 lg:px-8">
            <article className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <section>
                <Link to="/" className="flex items-center gap-2 mb-4">
                  <figure className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: Colors.primary }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={Colors.white} strokeWidth="2" strokeLinecap="round"/>
                      <rect x="4" y="6" width="16" height="12" rx="2" stroke={Colors.white} strokeWidth="2"/>
                      <circle cx="8" cy="20" r="2" fill={Colors.white}/>
                      <circle cx="16" cy="20" r="2" fill={Colors.white}/>
                    </svg>
                  </figure>
                  <span className="font-medium" style={{ color: Colors.primary }}>Basis Transport</span>
                </Link>
                <p style={{ color: Colors.neutralLight }} className="text-sm mt-4">
                  Making daily commutes simple, predictable, and stress-free.
                </p>
              </section>

              <section className="animate-on-scroll">
                <h3 className="font-medium mb-4" style={{ color: Colors.primary }}>
                  Product
                </h3>
                <ul className="space-y-3 text-sm" style={{ color: Colors.neutralLight }}>
                  <li><a href="#how-it-works" className="hover:opacity-70 text-[13px] transition-opacity">How it works</a></li>
                  <li><a href="#" className="hover:opacity-70 text-[13px] transition-opacity">Supported cities</a></li>
                  <li><a href="#" className="hover:opacity-70 text-[13px] transition-opacity">About us</a></li>
                </ul>
              </section>

              <section className="animate-on-scroll">
                <h3 className="font-medium mb-4" style={{ color: Colors.primary }}>
                  Support
                </h3>
                <ul className="space-y-3 text-sm" style={{ color: Colors.neutralLight }}>
                  <li><a href="#" className="hover:opacity-70 text-[13px] transition-opacity">Help center</a></li>
                  <li><a href="#" className="hover:opacity-70 text-[13px] transition-opacity">Contact us</a></li>
                  <li><a href="#" className="hover:opacity-70 text-[13px] transition-opacity">Privacy</a></li>
                </ul>
              </section>
            </article>

            <section className="pt-8 border-t" style={{ borderColor: `${Colors.primary}15` }}>
              <p className="text-sm leading-relaxed mb-4" style={{ color: Colors.neutralLight }}>
                <span className='text-[13px] font-medium'>This service is free to use and supported by advertisements.</span> We will always be free for everyday commuters. Our goal is to help you travel with confidence, not to charge you for it.
              </p>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t" style={{ borderColor: `${Colors.primary}15` }}>
                <p className="text-xs" style={{ color: Colors.neutralLight }}>
                  © 2026 Basis Transport. All rights reserved.
                </p>
                <nav className="flex gap-6 text-xs">
                  <a href="#" className="hover:opacity-70 text-[13px] transition-opacity" style={{ color: Colors.neutralLight }}>Privacy Policy</a>
                  <a href="#" className="hover:opacity-70 text-[13px] transition-opacity" style={{ color: Colors.neutralLight }}>Terms of Service</a>
                  <a href="#" className="hover:opacity-70 text-[13px] transition-opacity" style={{ color: Colors.neutralLight }}>Cookies</a>
                </nav>
              </div>
            </section>
          </section>
        </footer>
      </main>
    </>
  );
};

export default LandingPage;
