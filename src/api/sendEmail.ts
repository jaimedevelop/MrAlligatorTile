// api/sendEmail.ts (or wherever your API routes are)
import { Request, Response } from 'express';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: process.env.MAILGUN_REGION === 'EU' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net'
});

const DOMAIN = process.env.MAILGUN_DOMAIN || '';
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || '';

export async function sendEmail(req: Request, res: Response) {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, text' 
      });
    }

    const msg = {
      from: `Mr. Alligator Plumbing <${BUSINESS_EMAIL}>`,
      to,
      subject,
      text,
      html: html || text
    };

    const result = await mg.messages.create(DOMAIN, msg);
    
    console.log('Email sent successfully:', result);
    res.status(200).json({ 
      success: true, 
      messageId: result.id,
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
}

// If using Express router
// export default router.post('/send-email', sendEmail);