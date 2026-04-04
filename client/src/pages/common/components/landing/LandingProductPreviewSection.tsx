import { publicColors as Colors } from '@/containers/public/publicTheme';

const LandingProductPreviewSection = () => {
  return (
    <section className="py-24" style={{ backgroundColor: Colors.white }}>
      <article className="max-w-4xl mx-auto px-6 lg:px-8">
        <header className="text-center mb-16 animate-on-scroll">
          <h2
            className="text-4xl lg:text-5xl leading-tight mb-6 font-light"
            style={{ color: Colors.primary }}
          >
            Designed to be simple
          </h2>
          <p style={{ color: Colors.neutralLight }}>
            No confusing menus. No unnecessary steps. Just the information you
            need.
          </p>
        </header>

        <figure
          className="animate-on-scroll rounded-2xl overflow-hidden border-2"
          style={{ borderColor: `${Colors.primary}20` }}
        >
          <article style={{ backgroundColor: Colors.bgAlt }}>
            <section className="p-6">
              <header className="mb-8">
                <p className="text-xs mb-4" style={{ color: Colors.neutralLight }}>
                  Your Next Bus
                </p>
                <div
                  className="rounded-xl p-6"
                  style={{ backgroundColor: Colors.white }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm" style={{ color: Colors.neutralLight }}>
                        Route 47 → Downtown
                      </p>
                      <p
                        className="text-3xl font-light mt-1"
                        style={{ color: Colors.primary }}
                      >
                        Arrives in 7 min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: '#16a34a' }}>
                        On time
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-xs mb-1" style={{ color: Colors.neutralLight }}>
                        Available seats
                      </p>
                      <p className="text-2xl font-light" style={{ color: Colors.primary }}>
                        12 left
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs mb-1" style={{ color: Colors.neutralLight }}>
                        Next buses
                      </p>
                      <p className="text-sm mt-1" style={{ color: Colors.neutralLight }}>
                        +15, +28 min
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <section>
                <p className="text-xs mb-4 font-medium" style={{ color: Colors.neutralLight }}>
                  YOUR STOPS
                </p>
                <ul className="space-y-3">
                  <li
                    className="rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: Colors.white }}
                  >
                    <p className="font-medium" style={{ color: Colors.primary }}>
                      Home (Downtown)
                    </p>
                    <p className="text-xs mt-1" style={{ color: Colors.neutralLight }}>
                      4 routes
                    </p>
                  </li>
                  <li
                    className="rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: Colors.white }}
                  >
                    <p className="font-medium" style={{ color: Colors.primary }}>
                      Work (Central Station)
                    </p>
                    <p className="text-xs mt-1" style={{ color: Colors.neutralLight }}>
                      3 routes
                    </p>
                  </li>
                </ul>
              </section>
            </section>
          </article>
        </figure>

        <footer className="text-center mt-12 animate-on-scroll">
          <p style={{ color: Colors.neutralLight }}>
            That&apos;s it. No clutter. No distractions. Just the bus
            information that matters to you.
          </p>
        </footer>
      </article>
    </section>
  );
};

export default LandingProductPreviewSection;
