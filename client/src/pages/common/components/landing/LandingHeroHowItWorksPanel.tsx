import Button from '@/components/inputs/Button';
import { publicClasses } from '@/containers/public/publicTheme';
import { publicColors as Colors } from '@/containers/public/publicTheme';
import { landingSteps } from './landingContent';

interface LandingHeroHowItWorksPanelProps {
  onCreateAccount: () => void;
}

const LandingHeroHowItWorksPanel = ({
  onCreateAccount,
}: LandingHeroHowItWorksPanelProps) => {
  return (
    <section className="flex w-full flex-col gap-5">
      <header>
        <p className={publicClasses.landingCardTitle}>How Basis works</p>
        <p className={`${publicClasses.landingMeta} mt-1`}>
          Three steps to your first confident commute.
        </p>
      </header>

      <ol className="flex flex-col gap-4">
        {landingSteps.map((step) => (
          <li key={step.step}>
            <article className="flex gap-4 rounded-md bg-white p-4 shadow-sm">
              <figure
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[14px] font-medium text-white"
                style={{ backgroundColor: Colors.primary }}
              >
                {step.step}
              </figure>
              <div>
                <h3 className={publicClasses.landingCardTitle}>{step.title}</h3>
                <p className={`${publicClasses.landingMeta} mt-1`}>
                  {step.description}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <Button
        onClick={(event) => {
          event.preventDefault();
          onCreateAccount();
        }}
        primary
        className="w-full sm:w-auto"
      >
        Create free account
      </Button>
    </section>
  );
};

export default LandingHeroHowItWorksPanel;
