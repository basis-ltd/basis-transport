import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

const primary = '#283618';
const muted = '#666666';
const bg = '#fafaf8';

export interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
}

export default function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Basis Transport password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h1" style={h1}>
              Password reset
            </Heading>
          </Section>
          <Section style={content}>
            <Text style={text}>Hi {userName || 'there'},</Text>
            <Text style={text}>
              We received a request to reset your password for Basis Transport.
              Click the button below to choose a new password. This link expires
              in one hour.
            </Text>
            <Section style={buttonSection}>
              <Button href={resetUrl} style={button}>
                Reset password
              </Button>
            </Section>
            <Text style={small}>
              If you did not request this, you can ignore this email. Your
              password will stay the same.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated message from Basis Transport.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: bg,
  fontFamily:
    "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '24px 0',
  maxWidth: '560px',
};

const header = {
  backgroundColor: primary,
  padding: '32px 24px',
  borderRadius: '8px 8px 0 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 300,
  margin: '0',
  textAlign: 'center' as const,
};

const content = {
  backgroundColor: '#ffffff',
  border: `1px solid ${primary}1a`,
  borderTop: 'none',
  padding: '32px 24px',
  borderRadius: '0 0 8px 8px',
};

const text = {
  color: '#2d2d2d',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '28px 0',
};

const button = {
  backgroundColor: primary,
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  textDecoration: 'none',
  display: 'inline-block',
};

const small = {
  color: muted,
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 0',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '24px',
};

const footerText = {
  color: muted,
  fontSize: '12px',
  margin: '0',
};
