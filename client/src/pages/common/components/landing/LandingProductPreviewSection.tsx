import { publicClasses, publicColors as Colors } from '@/containers/public/publicTheme';

const LandingProductPreviewSection = () => {
  return (
    <section className={publicClasses.section} style={{ backgroundColor: Colors.white }}>
      <article className={publicClasses.container}>
        <header className="text-center mb-16 animate-on-scroll">
          <h2
            className={`${publicClasses.landingSectionTitle} mb-6`}
            style={{ color: Colors.primary }}
          >
            Designed to be simple
          </h2>
          <p
            className={publicClasses.bodyMuted}
            style={{ color: Colors.neutralLight }}
          >
            No confusing menus. No unnecessary steps. Just the information you
            need.
          </p>
        </header>

        <figure className="animate-on-scroll rounded-md overflow-hidden shadow-sm">
          <article style={{ backgroundColor: Colors.bgAlt }}>
            <section className="p-6">
              <header className="mb-8">
                <p
                  className={`${publicClasses.bodyMuted} mb-4`}
                  style={{ color: Colors.neutralLight }}
                >
                  Your Next Bus
                </p>
                <div
                  className="rounded-md p-6 shadow-sm"
                  style={{ backgroundColor: Colors.white }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p
                        className={publicClasses.bodyMuted}
                        style={{ color: Colors.neutralLight }}
                      >
                        Route 47 → Downtown
                      </p>
                      <p
                        className={`${publicClasses.statValue} mt-1`}
                        style={{ color: Colors.primary }}
                      >
                        Arrives in 7 min
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-[12px] font-medium"
                        style={{ color: Colors.neutral }}
                      >
                        On time
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p
                        className={`${publicClasses.bodyMuted} mb-1`}
                        style={{ color: Colors.neutralLight }}
                      >
                        Available seats
                      </p>
                      <p
                        className={publicClasses.statValue}
                        style={{ color: Colors.primary }}
                      >
                        12 left
                      </p>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`${publicClasses.bodyMuted} mb-1`}
                        style={{ color: Colors.neutralLight }}
                      >
                        Next buses
                      </p>
                      <p
                        className={`${publicClasses.bodyMuted} mt-1`}
                        style={{ color: Colors.neutralLight }}
                      >
                        +15, +28 min
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <section>
                <p
                  className={`${publicClasses.bodyMuted} mb-4 font-medium`}
                  style={{ color: Colors.neutralLight }}
                >
                  YOUR STOPS
                </p>
                <ul className="space-y-3">
                  <li
                    className="rounded-md p-4 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: Colors.white }}
                  >
                    <p
                      className={publicClasses.cardTitle}
                      style={{ color: Colors.primary }}
                    >
                      Home (Downtown)
                    </p>
                    <p
                      className={`${publicClasses.bodyMuted} mt-1`}
                      style={{ color: Colors.neutralLight }}
                    >
                      4 routes
                    </p>
                  </li>
                  <li
                    className="rounded-md p-4 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: Colors.white }}
                  >
                    <p
                      className={publicClasses.cardTitle}
                      style={{ color: Colors.primary }}
                    >
                      Work (Central Station)
                    </p>
                    <p
                      className={`${publicClasses.bodyMuted} mt-1`}
                      style={{ color: Colors.neutralLight }}
                    >
                      3 routes
                    </p>
                  </li>
                </ul>
              </section>
            </section>
          </article>
        </figure>

        <footer className="text-center mt-12 animate-on-scroll">
          <p
            className={publicClasses.bodyMuted}
            style={{ color: Colors.neutralLight }}
          >
            That&apos;s it. No clutter. No distractions. Just the bus
            information that matters to you.
          </p>
        </footer>
      </article>
    </section>
  );
};

export default LandingProductPreviewSection;
