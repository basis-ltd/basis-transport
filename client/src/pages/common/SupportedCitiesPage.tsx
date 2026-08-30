import PublicContentPage from './PublicContentPage';

const cities = [
  {
    name: 'Kigali',
    status: 'Live',
    detail: 'Full schedule, capacity, and route guidance across major corridors.',
  },
  {
    name: 'Musanze',
    status: 'Expanding',
    detail: 'Core routes and stop coverage rolling out with operator partners.',
  },
  {
    name: 'Huye',
    status: 'Planned',
    detail: 'On the roadmap — join the waitlist via Contact us to get notified.',
  },
];

const SupportedCitiesPage = () => (
  <PublicContentPage
    title="Supported cities"
    description="Where Basis Transport is live today — and where we're heading next."
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
