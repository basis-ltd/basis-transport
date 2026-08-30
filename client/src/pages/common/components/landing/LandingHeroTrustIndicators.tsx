interface LandingHeroTrustIndicatorsProps {
  commutesValue: string;
  usersValue: string;
}

const LandingHeroTrustIndicators = ({
  commutesValue,
  usersValue,
}: LandingHeroTrustIndicatorsProps) => {
  const items = [
    `${commutesValue} commutes planned`,
    `${usersValue} travellers`,
    'Live schedules and capacity',
  ];

  return (
    <p className="landing-meta flex flex-wrap items-center gap-x-2">
      {items.map((item, index) => (
        <span key={item} className="inline-flex items-center gap-x-2">
          {index > 0 ? <span aria-hidden="true">·</span> : null}
          <span>{item}</span>
        </span>
      ))}
    </p>
  );
};

export default LandingHeroTrustIndicators;
