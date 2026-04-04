export const landingHeroStats = [
  { value: '2.3M', label: 'Daily commuters' },
  { value: '15 mins', label: 'Avg time saved' },
  { value: '98%', label: 'Happy users' },
];

export const landingBenefits = [
  {
    title: 'Confidence before you leave',
    description:
      'You know exactly when your bus arrives. No second-guessing. No checking twice. Just leave home with peace of mind.',
    animationDelay: '0s',
  },
  {
    title: 'Saved time every single day',
    description:
      'No more waiting around. No more showing up early "just in case." You arrive at exactly the right moment.',
    animationDelay: '0.1s',
  },
  {
    title: "Know you'll have a seat",
    description:
      'See if your bus is crowded before you board. Choose to wait for a less busy one, or pack light and stand comfortably.',
    animationDelay: '0.2s',
  },
  {
    title: 'In control of your commute',
    description:
      "No more hoping. No more guessing. You decide when to leave, when to travel, when to relax. That's control.",
    animationDelay: '0.3s',
  },
];

export type LandingFeatureIcon =
  | 'arrivals'
  | 'seats'
  | 'history'
  | 'alerts';

export const landingFeatures = [
  {
    title: 'Real-time arrivals',
    description:
      "See exactly when your bus will arrive. Updated every few seconds so you're never guessing.",
    animationDelay: '0s',
    icon: 'arrivals' as LandingFeatureIcon,
  },
  {
    title: 'Available seats',
    description:
      'Know how busy your bus is before you board. Travel comfortably or wait for the next one.',
    animationDelay: '0.1s',
    icon: 'seats' as LandingFeatureIcon,
  },
  {
    title: 'Trip history',
    description:
      'See your routes and favorite stops. Quickly book the same commute over and over.',
    animationDelay: '0.2s',
    icon: 'history' as LandingFeatureIcon,
  },
  {
    title: 'Smart alerts',
    description: 'Get notified before your bus arrives. Never miss a ride again.',
    animationDelay: '0.3s',
    icon: 'alerts' as LandingFeatureIcon,
  },
];

export const landingSteps = [
  {
    step: '1',
    title: 'Create your account',
    description:
      "Free signup. No credit card. Just your phone number and you're in.",
    animationDelay: '0s',
  },
  {
    step: '2',
    title: 'Pick your stop',
    description: 'Search for your bus stop. Save your favorites for next time.',
    animationDelay: '0.15s',
  },
  {
    step: '3',
    title: 'Travel with confidence',
    description:
      "See your bus arriving. Know there's a seat. Leave home exactly on time.",
    animationDelay: '0.3s',
  },
];

export const landingTestimonials = [
  {
    quote:
      '"I used to wake up 30 minutes early just to be safe. Now I know exactly when my bus comes. That\'s 2.5 hours a week back."',
    author: 'James',
    role: 'student',
    animationDelay: '0s',
  },
  {
    quote:
      '"Checking seat availability changed everything. No more being packed in like sardines. I actually look forward to my commute now."',
    author: 'Sarah',
    role: 'professional',
    animationDelay: '0.1s',
  },
];
