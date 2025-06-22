import { User } from '../entities/user.entity';

export const userCreatedTemplate = ({
  password,
  user,
}: {
  user: Partial<User>;
  password: string;
}) => {
  const currentYear = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Basis Transport</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f0f3f3;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }
        .header {
          background-color: #283618; /* Primary Color */
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .content p {
          margin: 0 0 15px;
        }
        .password-box {
          background-color: #f0f3f3;
          padding: 20px;
          border-radius: 4px;
          margin: 25px 0;
          text-align: center;
          border: 1px dashed #344e41; /* Secondary Color */
        }
        .password-text {
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 3px;
          color: #283618; /* Primary Color */
        }
        .cta-button {
          display: block;
          width: fit-content;
          margin: 30px auto 0;
          background-color: #283618; /* Primary Color */
          color: #ffffff !important;
          padding: 15px 25px;
          text-decoration: none;
          border-radius: 5px;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding: 20px;
          color: #666;
          font-size: 0.9em;
          background-color: #f0f3f3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome, ${user.name || 'User'}!</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name || 'User'},</p>
          <p>We are thrilled to have you on board. Your account for <strong>Basis Transport</strong> has been successfully created.</p>
          <p>Below are your temporary login credentials. Please use them for your first login.</p>
          
          <div class="password-box">
            <p style="margin: 0 0 10px;">Your temporary password is:</p>
            <p class="password-text">${password}</p>
          </div>

          <p>For security reasons, we strongly recommend that you change your password immediately after logging in for the first time.</p>
          
          <a href="#" class="cta-button">Login to Your Account</a>

          <p style="margin-top: 20px;">If you did not request this account, please ignore this email or contact our support team.</p>
        </div>
      </div>
      <div class="footer">
        <p>This is an automated message, please do not reply.</p>
        <p>&copy; ${currentYear} Basis Transport. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
