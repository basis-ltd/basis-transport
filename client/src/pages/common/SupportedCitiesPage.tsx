import PublicContentPage from './PublicContentPage';

const cities = [
  {
    name: 'Kigali',
    status: 'Internal network beta',
    detail: 'Historic network under review. Current service and usage rights must be verified before public release.',
  },
  {
    name: 'Musanze',
    status: 'Not supported',
    detail: 'No verified network is currently published.',
  },
  {
    name: 'Huye',
    status: 'Not supported',
    detail: 'No verified network is currently published.',
  },
];

const SupportedCitiesPage = () => (
  <PublicContentPage
    title="Supported cities"
    description="Coverage and verification status for the journey planner."
    canonicalPath="/cities"
    eyebrow="Coverage"
  >
    <ul className="!list-none !ps-0 space-y-4">
      {cities.map((city) => (
        <li
          key={city.name}
          className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--landing-radius)] border border-[var(--landing-line)] p-5"
        >
          <div>
            <h2 className="!mt-0">{city.name}</h2>
            <p>{city.detail}</p>
          </div>
          <span className="landing-meta rounded-full border border-[var(--landing-line)] px-3 py-1">
            {city.status}
          </span>
        </li>
      ))}
    </ul>
  </PublicContentPage>
);

export default SupportedCitiesPage;
