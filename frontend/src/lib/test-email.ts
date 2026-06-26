import { sendBookingConfirmationEmail } from './mail';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runTest() {
  const targetEmail = process.env.SMTP_USER || 'your-email@example.com';
  console.log(`🚀 Triggering test booking confirmation email to: ${targetEmail}`);
  console.log('Make sure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are set in frontend/.env');

  const success = await sendBookingConfirmationEmail(
    101,
    targetEmail,
    'Vishal Mishra',
    'Alpha Boardroom',
    'Floor 4, North Wing',
    new Date(),
    new Date(Date.now() + 30 * 60 * 1000),
    'Lumina Reserve Setup Verification'
  );

  if (success) {
    console.log('🎉 Verification run complete!');
    if (!process.env.SMTP_HOST) {
      console.log('ℹ️ SMTP is not configured. The email was logged in console above (Simulated Mode).');
    } else {
      console.log(`✉️ Real email sent! Please check your inbox for: ${targetEmail}`);
    }
  } else {
    console.log('❌ Verification run failed. Please check error logs above.');
  }
}

runTest();
