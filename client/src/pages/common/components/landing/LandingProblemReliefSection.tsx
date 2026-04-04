import { publicColors as Colors } from '@/containers/public/publicTheme';

const LandingProblemReliefSection = () => {
  return (
    <section className="py-24" style={{ backgroundColor: Colors.white }}>
      <article className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <aside className="animate-on-scroll">
            <h2
              className="text-3xl lg:text-4xl leading-tight mb-6 font-light"
              style={{ color: Colors.primary }}
            >
              The stress of not knowing
            </h2>
            <p
              className="text-base leading-relaxed mb-6"
              style={{ color: Colors.neutralLight }}
            >
              You check the time. You check the street. Is your bus here? Did
              you miss it? Will you be late? Every commute is a guess, and
              guessing makes you anxious.
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: Colors.neutralLight }}
            >
              You wonder if there&apos;s a seat. You stress about being packed
              in. You don&apos;t know if you should wait or walk to the next
              stop.
            </p>
          </aside>

          <aside className="animate-on-scroll" style={{ animationDelay: '0.15s' }}>
            <h2
              className="text-3xl lg:text-4xl leading-tight mb-6 font-light"
              style={{ color: Colors.primary }}
            >
              The calm of knowing
            </h2>
            <p
              className="text-base leading-relaxed mb-6"
              style={{ color: Colors.neutralLight }}
            >
              Open Basis. See your bus coming in 7 minutes. You know exactly
              when to leave. No stress. No surprises.
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: Colors.neutralLight }}
            >
              Check how many seats are open. Travel when you&apos;re ready. That
              15 minutes you save every day? That&apos;s time for coffee, or
              just breathing.
            </p>
          </aside>
        </div>
      </article>
    </section>
  );
};

export default LandingProblemReliefSection;
