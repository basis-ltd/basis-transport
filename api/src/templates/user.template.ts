import { User } from '../entities/user.entity';

export const userCreatedTemplate = ({
  password,
  user,
}: {
  user: Partial<User>;
  password: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4A6C6F;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 0 0 8px 8px;
        }
        .password-box {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          text-align: center;
          border: 1px dashed #4A6C6F;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Welcome ${user.name || 'User'}!</h1>
      </header>
      <main>
        <p>Dear ${user.name || 'User'},</p>
        <p>We're excited to welcome you! Your account has been successfully created.</p>
        
        <section>
          <p><strong>Your temporary password:</strong></p>
          <p style="font-size: 18px; letter-spacing: 2px;">${password}</p>
        </section>

        <p>For security reasons, we recommend changing your password after your first login.</p>
        
        <p>You can now access the platform using your email address and the password provided above.</p>
      </main>
      <footer>
        <p>This is an automated message, please do not reply to this email.</p>
      </footer>
    </body>
    </html>
  `;
};
