import Button from '@/components/inputs/Button';
import Input from '@/components/inputs/Input';
import TextArea from '@/components/inputs/TextArea';
import validateInputs from '@/helpers/validations.helper';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import PublicContentPage from './PublicContentPage';
import { useState } from 'react';
import { networkRequest } from '@/features/journey/api';

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

const ContactUsPage = () => {
  const [sending, setSending] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>();

  const onSubmit = handleSubmit(async (data) => {
    setSending(true);
    try {
      await networkRequest('/reports', { method: 'POST', body: JSON.stringify({kind:'contact',name:data.name,email:data.email,message:data.message}) });
      toast.success('Your message has been received.');
      reset();
    } catch (error) { toast.error((error as Error).message); }
    finally { setSending(false); }
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
          <Button type="submit" primary isLoading={sending}>
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
