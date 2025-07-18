// src/services/emailService.ts
import { Appointment } from '../types/types';

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Frontend - call your backend API
async function sendEmail(emailData: EmailData) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Email API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Email Templates
const emailTemplates = {
  // User receives this when they submit an appointment request
  appointmentRequestConfirmation: (appointment: Appointment) => ({
    subject: 'Appointment Request Received - Mr. Alligator Plumbing',
    text: `
Hello ${appointment.customerName},

Thank you for requesting an appointment with Mr. Alligator Plumbing!

We have received your appointment request with the following details:

Service Type: ${appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}
Preferred Date: ${appointment.preferredDate.toLocaleDateString()}
Preferred Time: ${appointment.preferredDate.toLocaleTimeString()}
Description: ${appointment.description || 'No description provided'}

Your request is currently being reviewed. We will contact you within 1 business hour to confirm your appointment.

If you have any questions or need to make changes, please call us at (813) 679-4905 or reply to this email.

Best regards,
Mr. Alligator Plumbing Team
Phone: (813) 679-4905
Email: mralligatorrenovations@gmail.com
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">Mr. Alligator Plumbing</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f8fafc;">
    <h2 style="color: #1e3a8a;">Appointment Request Received</h2>
    
    <p>Hello <strong>${appointment.customerName}</strong>,</p>
    
    <p>Thank you for requesting an appointment with Mr. Alligator Plumbing!</p>
    
    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="color: #1e3a8a; margin-top: 0;">Appointment Details:</h3>
      <p><strong>Service Type:</strong> ${appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}</p>
      <p><strong>Preferred Date:</strong> ${appointment.preferredDate.toLocaleDateString()}</p>
      <p><strong>Preferred Time:</strong> ${appointment.preferredDate.toLocaleTimeString()}</p>
      <p><strong>Description:</strong> ${appointment.description || 'No description provided'}</p>
    </div>
    
    <p>Your request is currently being reviewed. We will contact you within 1 business hour to confirm your appointment.</p>
    
    <p>If you have any questions or need to make changes, please call us at <a href="tel:+18136794905">(813) 679-4905</a> or reply to this email.</p>
    
    <p>Best regards,<br>
    <strong>Mr. Alligator Plumbing Team</strong><br>
    Phone: <a href="tel:+18136794905">(813) 679-4905</a><br>
    Email: <a href="mailto:mralligatorrenovations@gmail.com">mralligatorrenovations@gmail.com</a></p>
  </div>
</div>
    `
  }),

  // Admin receives this when a new appointment request comes in
  newAppointmentAlert: (appointment: Appointment) => ({
    subject: `New Appointment Request - ${appointment.customerName}`,
    text: `
New appointment request received!

Customer Details:
Name: ${appointment.customerName}
Email: ${appointment.customerEmail}
Phone: ${appointment.customerPhone}

Appointment Details:
Service Type: ${appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}
Preferred Date: ${appointment.preferredDate.toLocaleDateString()}
Preferred Time: ${appointment.preferredDate.toLocaleTimeString()}
Description: ${appointment.description || 'No description provided'}

Status: ${appointment.status}
Submitted: ${appointment.createdAt.toLocaleString()}

Please review and respond to this appointment request promptly.
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">New Appointment Request</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f8fafc;">
    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="color: #1e3a8a; margin-top: 0;">Customer Details:</h3>
      <p><strong>Name:</strong> ${appointment.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${appointment.customerEmail}">${appointment.customerEmail}</a></p>
      <p><strong>Phone:</strong> <a href="tel:${appointment.customerPhone}">${appointment.customerPhone}</a></p>
    </div>
    
    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <h3 style="color: #1e3a8a; margin-top: 0;">Appointment Details:</h3>
      <p><strong>Service Type:</strong> ${appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}</p>
      <p><strong>Preferred Date:</strong> ${appointment.preferredDate.toLocaleDateString()}</p>
      <p><strong>Preferred Time:</strong> ${appointment.preferredDate.toLocaleTimeString()}</p>
      <p><strong>Description:</strong> ${appointment.description || 'No description provided'}</p>
      <p><strong>Status:</strong> ${appointment.status}</p>
      <p><strong>Submitted:</strong> ${appointment.createdAt.toLocaleString()}</p>
    </div>
    
    <p style="color: #dc2626; font-weight: bold;">Please review and respond to this appointment request promptly.</p>
  </div>
</div>
    `
  }),

  // User receives this when appointment is approved
  appointmentApproved: (appointment: Appointment) => ({
    subject: 'Appointment Confirmed - Mr. Alligator Plumbing',
    text: `
Hello ${appointment.customerName},

Great news! Your appointment with Mr. Alligator Plumbing has been CONFIRMED.

Confirmed Appointment Details:
Service Type: ${appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}
Date: ${appointment.preferredDate.toLocaleDateString()}
Time: ${appointment.preferredDate.toLocaleTimeString()}
Description: ${appointment.description || 'No description provided'}

Please make sure someone is available at the scheduled time. Our technician will arrive promptly.

If you need to reschedule or cancel, please call us at (813) 679-4905 as soon as possible.

We look forward to serving you!

Best regards,
Mr. Alligator Plumbing Team
Phone: (813) 679-4905
Email: mralligatorrenovations@gmail.com
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">Appointment Confirmed!</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f8fafc;">
    <p>Hello <strong>${appointment.customerName}</strong>,</p>
    
    <p style="color: #059669; font-weight: bold; font-size: 18px;">Great news! Your appointment with Mr. Alligator Plumbing has been CONFIRMED.</p>
    
    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #059669;">
      <h3 style="color: #1e3a8a; margin-top: 0;">Confirmed Appointment Details:</h3>
      <p><strong>Service Type:</strong> ${appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}</p>
      <p><strong>Date:</strong> ${appointment.preferredDate.toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${appointment.preferredDate.toLocaleTimeString()}</p>
      <p><strong>Description:</strong> ${appointment.description || 'No description provided'}</p>
    </div>
    
    <p>Please make sure someone is available at the scheduled time. Our technician will arrive promptly.</p>
    
    <p>If you need to reschedule or cancel, please call us at <a href="tel:+18136794905">(813) 679-4905</a> as soon as possible.</p>
    
    <p style="color: #059669; font-weight: bold;">We look forward to serving you!</p>
    
    <p>Best regards,<br>
    <strong>Mr. Alligator Plumbing Team</strong><br>
    Phone: <a href="tel:+18136794905">(813) 679-4905</a><br>
    Email: <a href="mailto:mralligatorrenovations@gmail.com">mralligatorrenovations@gmail.com</a></p>
  </div>
</div>
    `
  }),

  // User receives this when appointment is rejected
  appointmentRejected: (appointment: Appointment) => ({
    subject: 'Appointment Update - Mr. Alligator Plumbing',
    text: `
Hello ${appointment.customerName},

We regret to inform you that we are unable to accommodate your appointment request for the following details:

Service Type: ${appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}
Requested Date: ${appointment.preferredDate.toLocaleDateString()}
Requested Time: ${appointment.preferredDate.toLocaleTimeString()}

This may be due to scheduling conflicts or other unforeseen circumstances. We apologize for any inconvenience.

Please feel free to submit a new appointment request with alternative dates and times, or call us directly at (813) 679-4905 to discuss available options.

We appreciate your understanding and look forward to serving you soon.

Best regards,
Mr. Alligator Plumbing Team
Phone: (813) 679-4905
Email: mralligatorrenovations@gmail.com
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">Appointment Update</h1>
  </div>
  
  <div style="padding: 20px; background-color: #f8fafc;">
    <p>Hello <strong>${appointment.customerName}</strong>,</p>
    
    <p>We regret to inform you that we are unable to accommodate your appointment request for the following details:</p>
    
    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc2626;">
      <h3 style="color: #1e3a8a; margin-top: 0;">Requested Appointment:</h3>
      <p><strong>Service Type:</strong> ${appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}</p>
      <p><strong>Requested Date:</strong> ${appointment.preferredDate.toLocaleDateString()}</p>
      <p><strong>Requested Time:</strong> ${appointment.preferredDate.toLocaleTimeString()}</p>
    </div>
    
    <p>This may be due to scheduling conflicts or other unforeseen circumstances. We apologize for any inconvenience.</p>
    
    <p>Please feel free to submit a new appointment request with alternative dates and times, or call us directly at <a href="tel:+18136794905">(813) 679-4905</a> to discuss available options.</p>
    
    <p>We appreciate your understanding and look forward to serving you soon.</p>
    
    <p>Best regards,<br>
    <strong>Mr. Alligator Plumbing Team</strong><br>
    Phone: <a href="tel:+18136794905">(813) 679-4905</a><br>
    Email: <a href="mailto:mralligatorrenovations@gmail.com">mralligatorrenovations@gmail.com</a></p>
  </div>
</div>
    `
  })
};

// Add this function to your emailService.ts file
export async function sendAppointmentStatusEmail(appointment: Appointment) {
  try {
    // This function will use the existing sendCustomerEmail logic
    // which already handles confirmed and rejected statuses
    await sendCustomerEmail(appointment);
    console.log(`Status email sent successfully for appointment ${appointment.id} with status: ${appointment.status}`);
  } catch (error) {
    console.error('Failed to send appointment status email:', error);
    throw error;
  }
}

// Main email sending functions that match your existing appointmentsService.ts imports
export async function sendCustomerEmail(appointment: Appointment) {
  try {
    let emailData;
    
    if (appointment.status === 'pending') {
      // Customer confirmation for new appointment request
      emailData = emailTemplates.appointmentRequestConfirmation(appointment);
    } else if (appointment.status === 'confirmed') {
      // Appointment approved
      emailData = emailTemplates.appointmentApproved(appointment);
    } else if (appointment.status === 'rejected') {
      // Appointment rejected
      emailData = emailTemplates.appointmentRejected(appointment);
    } else {
      // Don't send emails for other status changes
      console.log(`No customer email template for status: ${appointment.status}`);
      return;
    }

    await sendEmail({
      to: appointment.customerEmail,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    });

    console.log(`Customer email sent successfully for status: ${appointment.status}`);
  } catch (error) {
    console.error('Failed to send customer email:', error);
    throw error;
  }
}

export async function sendAdminEmail(appointment: Appointment) {
  try {
    if (appointment.status !== 'pending') {
      // Only send admin alerts for new pending appointments
      console.log(`No admin email needed for status: ${appointment.status}`);
      return;
    }

    const emailData = emailTemplates.newAppointmentAlert(appointment);
    
    await sendEmail({
      to: 'mralligatorrenovations@gmail.com', // Admin email
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
    });

    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('Failed to send admin email:', error);
    throw error;
  }
}