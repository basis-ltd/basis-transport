import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import TelInput from '@/components/inputs/TelInput';
import TextArea from '@/components/inputs/TextArea';
import validateInputs from '@/helpers/validations.helper';
import { validatePhoneNumber } from '@/utils/phone.util';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import PublicContentPage from './PublicContentPage';

interface ContactFormValues {
  name: string;
  email: string;
  phoneNumber?: string;
  message: string;
}

const ContactUsPage = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>();

  const onSubmit = handleSubmit((data) => {
    toast.success(
      `Thanks, ${data.name}. We received your message and will get back to you soon.`,
    );
    reset();
  });

  return (
    <PublicContentPage
      title="Contact us"
      description="Questions about routes, accounts, or partnerships? Send us a message and we'll respond as soon as we can."
      canonicalPath="/contact"
      eyebrow="Support"
    >
      <form className="grid gap-5" onSubmit={onSubmit}>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Enter your name' }}
          render={({ field }) => (
            <Input
              {...field}
              label="Your name"
              placeholder="Full name"
              autoComplete="name"
              required
              errorMessage={errors.name?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Enter your email',
            validate: (value) =>
              validateInputs(value, 'email') || 'Enter a valid email address',
          }}
          render={({ field }) => (
            <Input
              {...field}
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              type="email"
              required
              errorMessage={errors.email?.message}
            />
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          rules={{
            validate: (value) => validatePhoneNumber(value, false),
          }}
          render={({ field }) => (
            <TelInput
              {...field}
              label="Phone (optional)"
              placeholder="7XX XXX XXX"
              errorMessage={errors.phoneNumber?.message}
            />
          )}
        />

        <Controller
          name="message"
          control={control}
          rules={{ required: 'Tell us how we can help' }}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Message"
              placeholder="How can we help?"
              required
              errorMessage={errors.message?.message}
            />
          )}
        />

        <div>
          <Button type="submit" primary>
            Send message
          </Button>
        </div>
      </form>

      <section className="mt-10 rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-surface)] p-5">
        <h2>Other ways to reach us</h2>
        <p>
          Email:{' '}
          <a href="mailto:support@basistransport.rw" className="landing-link-sweep">
            support@basistransport.rw
          </a>
        </p>
        <p className="landing-meta mt-2">We typically reply within one business day.</p>
      </section>
    </PublicContentPage>
  );
};

export default ContactUsPage;
