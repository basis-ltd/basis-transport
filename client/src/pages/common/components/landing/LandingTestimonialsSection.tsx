import { publicClasses, publicColors as Colors } from '@/containers/public/publicTheme';
import { landingTestimonials } from './landingContent';

const LandingTestimonialsSection = () => {
  return (
    <section className={publicClasses.section} style={{ backgroundColor: Colors.bgAlt }}>
      <article className={publicClasses.container}>
        <header className="text-center mb-16 animate-on-scroll">
          <h2
            className={`${publicClasses.landingSectionTitle} mb-6`}
            style={{ color: Colors.primary }}
          >
            Real people. Real time saved.
          </h2>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {landingTestimonials.map((testimonial) => (
            <li
              key={testimonial.author}
              className={`animate-on-scroll ${publicClasses.card}`}
              style={{ animationDelay: testimonial.animationDelay }}
            >
              <blockquote>
                <p
                  className={`${publicClasses.bodyMuted} mb-6`}
                  style={{ color: Colors.neutral }}
                >
                  {testimonial.quote}
                </p>
                <footer>
                  <cite
                    className="not-italic text-[12px] font-medium"
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
