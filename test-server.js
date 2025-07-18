import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
// Use port 3000 for local testing
const PORT = process.env.PORT || 3000;

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Admin data file (will store hashed password)
const ADMIN_FILE = path.join(__dirname, 'admin-data.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

// ===========================================
// ADMIN AUTHENTICATION FUNCTIONS
// ===========================================

// Check if admin exists
function adminExists() {
  return fs.existsSync(ADMIN_FILE);
}

// Create admin (one-time setup)
async function createAdmin(email, password) {
  if (adminExists()) {
    throw new Error('Admin already exists');
  }
  
  const hashedPassword = await bcrypt.hash(password, 12);
  const adminData = {
    email: email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminData, null, 2));
  return true;
}

// Verify admin credentials
async function verifyAdmin(email, password) {
  if (!adminExists()) {
    return false;
  }
  
  const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
  
  if (adminData.email !== email) {
    return false;
  }
  
  return await bcrypt.compare(password, adminData.password);
}

// Generate JWT token
function generateToken(email) {
  return jwt.sign({ email, isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded || !decoded.isAdmin) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.admin = decoded;
  next();
}

// ===========================================
// BASIC MIDDLEWARE SETUP
// ===========================================

// Add JSON parsing middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('Request Path:', req.path);
  next();
});

// ===========================================
// API ROUTES (MUST COME BEFORE STATIC FILES)
// ===========================================

// Check if admin setup is needed
app.get('/api/admin/setup-status', (req, res) => {
  res.json({ 
    needsSetup: !adminExists(),
    message: adminExists() ? 'Admin already configured' : 'Admin setup required'
  });
});

// One-time admin setup
app.post('/api/admin/setup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (adminExists()) {
      return res.status(400).json({ error: 'Admin already exists' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    await createAdmin(email, password);
    const token = generateToken(email);
    
    res.json({ 
      success: true, 
      message: 'Admin created successfully',
      token 
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const isValid = await verifyAdmin(email, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(email);
    res.json({ 
      success: true, 
      message: 'Login successful',
      token 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify admin token
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ 
    success: true, 
    admin: req.admin 
  });
});

// Protected admin route example - appointments
app.get('/api/admin/appointments', requireAdmin, (req, res) => {
  // You can add your existing admin functionality here
  res.json({ 
    success: true,
    message: 'Admin appointments access granted',
    appointments: [] // Add your appointment data here
  });
});

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    // Import mailgun-js dynamically
    const mailgun = (await import('mailgun-js')).default;
    
    const mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });

    const { to, subject, text, html } = req.body;

    const emailData = {
      from: process.env.MAILGUN_FROM_EMAIL || 'noreply@mralligatorrenovations.com',
      to: to,
      subject: subject,
      text: text
    };

    // Add HTML if provided
    if (html) {
      emailData.html = html;
    }

    console.log('Sending email with data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      domain: process.env.MAILGUN_DOMAIN
    });

    const result = await mg.messages().send(emailData);
    console.log('Email sent successfully:', result);
    res.json({ success: true, messageId: result.id });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ping endpoint
app.get('/api/ping', (_req, res) => {
  res.send({ message: 'pong' });
});

// Add this debug endpoint to your test-server.js (after the existing endpoints)

// Debug email configuration
app.get('/api/debug/email-config', (req, res) => {
  res.json({
    hasApiKey: !!process.env.MAILGUN_API_KEY,
    hasDomain: !!process.env.MAILGUN_DOMAIN,
    hasFromEmail: !!process.env.MAILGUN_FROM_EMAIL,
    apiKeyLength: process.env.MAILGUN_API_KEY?.length || 0,
    domain: process.env.MAILGUN_DOMAIN || 'NOT SET',
    fromEmail: process.env.MAILGUN_FROM_EMAIL || 'NOT SET'
  });
});

// Test email endpoint
app.post('/api/debug/test-email', async (req, res) => {
  try {
    console.log('=== EMAIL DEBUG TEST ===');
    console.log('Environment check:');
    console.log('- API Key exists:', !!process.env.MAILGUN_API_KEY);
    console.log('- Domain:', process.env.MAILGUN_DOMAIN);
    console.log('- From Email:', process.env.MAILGUN_FROM_EMAIL);
    
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      return res.status(500).json({ 
        error: 'Missing Mailgun configuration',
        details: {
          hasApiKey: !!process.env.MAILGUN_API_KEY,
          hasDomain: !!process.env.MAILGUN_DOMAIN
        }
      });
    }

    const mailgun = (await import('mailgun-js')).default;
    const mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });

    const testEmail = {
      from: process.env.MAILGUN_FROM_EMAIL || 'test@yourdomain.com',
      to: req.body.to || 'test@example.com',
      subject: 'Test Email from Mr. Alligator',
      text: 'This is a test email to verify Mailgun configuration.'
    };

    console.log('Sending test email:', testEmail);
    const result = await mg.messages().send(testEmail);
    console.log('Email sent successfully:', result);
    
    res.json({ 
      success: true, 
      messageId: result.id,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message,
      stack: error.stack
    });
  }
});

// ===========================================
// STATIC FILES (MUST COME AFTER API ROUTES)
// ===========================================

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// ===========================================
// CATCH-ALL ROUTE (MUST BE LAST)
// ===========================================

// Serve React app for non-API routes
app.use((req, res) => {
  // Don't serve React app for API routes that weren't found
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen on localhost only for testing
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Admin setup needed: ${!adminExists()}`);
});