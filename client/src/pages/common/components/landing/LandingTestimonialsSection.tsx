import { publicColors as Colors } from '@/containers/public/publicTheme';
import { landingTestimonials } from './landingContent';

const LandingTestimonialsSection = () => {
  return (
    <section className="py-24" style={{ backgroundColor: Colors.bgAlt }}>
      <article className="max-w-4xl mx-auto px-6 lg:px-8">
        <header className="text-center mb-16 animate-on-scroll">
          <h2
            className="text-4xl lg:text-5xl leading-tight mb-6 font-light"
            style={{ color: Colors.primary }}
          >
            Real people. Real time saved.
          </h2>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {landingTestimonials.map((testimonial) => (
            <li
              key={testimonial.author}
              className="animate-on-scroll rounded-xl p-8"
              style={{
                backgroundColor: Colors.white,
                animationDelay: testimonial.animationDelay,
              }}
            >
              <blockquote>
                <p
                  className="text-lg leading-relaxed mb-6"
                  style={{ color: Colors.neutral }}
                >
                  {testimonial.quote}
                </p>
                <footer>
                  <cite
                    className="not-italic font-medium"
                    style={{ color: Colors.primary }}
                  >
                    {`— ${testimonial.author}, ${testimonial.role}`}
                  </cite>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default LandingTestimonialsSection;
