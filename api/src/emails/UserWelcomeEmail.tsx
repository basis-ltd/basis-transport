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
const secondary = '#344e41';
const muted = '#666666';
const boxBg = '#f0f3f3';

export interface UserWelcomeEmailProps {
  userName?: string;
  password: string;
  loginUrl: string;
  year: number;
}

export default function UserWelcomeEmail({
  userName,
  password,
  loginUrl,
  year,
}: UserWelcomeEmailProps) {
  const name = userName || 'User';
  return (
    <Html>
      <Head />
      <Preview>Welcome to Basis Transport</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading as="h1" style={h1}>
              Welcome, {name}!
            </Heading>
          </Section>
          <Section style={content}>
            <Text style={text}>Dear {name},</Text>
            <Text style={text}>
              We are thrilled to have you on board. Your account for{' '}
              <strong>Basis Transport</strong> has been successfully created.
            </Text>
            <Text style={text}>
              Below are your temporary login credentials. Please use them for
              your first login.
            </Text>
            <Section style={passwordBox}>
              <Text style={passwordLabel}>Your temporary password is:</Text>
              <Text style={passwordValue}>{password}</Text>
            </Section>
            <Text style={text}>
              For security reasons, we strongly recommend that you change your
              password immediately after logging in for the first time.
            </Text>
            <Section style={buttonSection}>
              <Button href={loginUrl} style={button}>
                Login to your account
              </Button>
            </Section>
            <Text style={small}>
              If you did not request this account, please ignore this email or
              contact our support team.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated message, please do not reply.
            </Text>
            <Text style={footerText}>
              &copy; {year} Basis Transport. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f0f3f3',
  fontFamily:
    "'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  margin: '20px auto',
  maxWidth: '600px',
};

const header = {
  backgroundColor: primary,
  padding: '40px 20px',
  borderRadius: '8px 8px 0 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 400,
  margin: '0',
  textAlign: 'center' as const,
};

const content = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderTop: 'none',
  padding: '30px',
  borderRadius: '0 0 8px 8px',
};

const text = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 15px',
};

const passwordBox = {
  backgroundColor: boxBg,
  padding: '20px',
  borderRadius: '4px',
  margin: '25px 0',
  textAlign: 'center' as const,
  border: `1px dashed ${secondary}`,
};

const passwordLabel = {
  margin: '0 0 10px',
  color: '#333333',
  fontSize: '15px',
};

const passwordValue = {
  fontSize: '20px',
  fontWeight: 700,
  letterSpacing: '3px',
  color: primary,
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '30px 0 0',
};

const button = {
  backgroundColor: primary,
  color: '#ffffff',
  padding: '15px 25px',
  borderRadius: '5px',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
};

const small = {
  color: '#333333',
  fontSize: '14px',
  marginTop: '20px',
  lineHeight: '22px',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '20px',
  padding: '20px',
  backgroundColor: boxBg,
};

const footerText = {
  color: muted,
  fontSize: '14px',
  margin: '0 0 8px',
};
