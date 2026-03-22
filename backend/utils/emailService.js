import nodemailer from 'nodemailer';

let transporter;

const createTransporter = () => {
  const {
    SMTP_SERVICE = 'gmail',
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }

  if (SMTP_HOST) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  return nodemailer.createTransport({
    service: SMTP_SERVICE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

export const sendInternshipStatusEmail = async ({ studentName, studentEmail, companyName, role, status }) => {
  const transport = getTransporter();

  if (!transport) {
    console.warn('Email notification skipped: SMTP_USER/SMTP_PASS is not configured.');
    return;
  }

  const isApproved = status === 'approved';
  const statusText = isApproved ? 'approved' : 'rejected';
  const subject = `Internship ${statusText}: ${companyName}`;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const text = [
    `Hello ${studentName || 'Student'},`,
    '',
    `Your internship at ${companyName} for the role ${role || 'Intern'} has been ${statusText} by admin.`,
    '',
    'Please log in to the Internship Monitoring System for details.',
    '',
    'Regards,',
    'Internship Monitoring Team'
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">Internship Status Update</h2>
      <p>Hello ${studentName || 'Student'},</p>
      <p>
        Your internship at <strong>${companyName}</strong>
        (${role || 'Intern'}) has been
        <strong style="color: ${isApproved ? '#047857' : '#b91c1c'}; text-transform: capitalize;">
          ${statusText}
        </strong>
        by admin.
      </p>
      <p>Please log in to the Internship Monitoring System for details.</p>
      <p style="margin-top: 16px;">Regards,<br/>Internship Monitoring Team</p>
    </div>
  `;

  await transport.sendMail({
    from,
    to: studentEmail,
    subject,
    text,
    html
  });
};
