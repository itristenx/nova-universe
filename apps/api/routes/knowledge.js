import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Mock knowledge base data for demo purposes
const mockArticles = {
  'vpn-setup': {
    id: '1',
    slug: 'vpn-setup',
    title: 'How to Connect to Company VPN',
    content: `
      <h2>Connecting to the Company VPN</h2>
      <p>This guide will walk you through the process of connecting to our company VPN for secure remote access.</p>
      
      <h3>Prerequisites</h3>
      <ul>
        <li>VPN credentials provided by IT department</li>
        <li>Stable internet connection</li>
        <li>Compatible device (Windows, Mac, iOS, Android)</li>
      </ul>
      
      <h3>Windows Setup</h3>
      <ol>
        <li>Open Settings > Network & Internet > VPN</li>
        <li>Click "Add a VPN connection"</li>
        <li>Select "Windows (built-in)" as VPN provider</li>
        <li>Enter connection name: "Company VPN"</li>
        <li>Enter server address: vpn.company.com</li>
        <li>Select "Username and password" for sign-in info</li>
        <li>Enter your provided credentials</li>
        <li>Click "Save"</li>
      </ol>
      
      <h3>Troubleshooting</h3>
      <p>If you encounter connection issues:</p>
      <ul>
        <li>Verify your credentials are correct</li>
        <li>Check your internet connection</li>
        <li>Try connecting from a different network</li>
        <li>Contact IT support if problems persist</li>
      </ul>
    `,
    category: 'Network & Connectivity',
    tags: ['vpn', 'security', 'remote-access'],
    author: {
      name: 'John Smith',
      email: 'john.smith@company.com'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    views: 1247,
    helpful: 89,
    notHelpful: 12,
    verified: true
  },
  'password-reset': {
    id: '2',
    slug: 'password-reset',
    title: 'Password Reset Guide',
    content: `
      <h2>Resetting Your Password</h2>
      <p>Follow these steps to reset your company password and set up two-factor authentication.</p>
      
      <h3>Self-Service Password Reset</h3>
      <ol>
        <li>Go to the company login page</li>
        <li>Click "Forgot Password"</li>
        <li>Enter your email address</li>
        <li>Check your email for reset instructions</li>
        <li>Follow the link in the email</li>
        <li>Create a new strong password</li>
      </ol>
      
      <h3>Password Requirements</h3>
      <ul>
        <li>At least 12 characters long</li>
        <li>Include uppercase and lowercase letters</li>
        <li>Include at least one number</li>
        <li>Include at least one special character</li>
        <li>Cannot be a previously used password</li>
      </ul>
      
      <h3>Setting Up Two-Factor Authentication</h3>
      <p>After resetting your password, set up 2FA for enhanced security:</p>
      <ol>
        <li>Log in with your new password</li>
        <li>Go to Account Settings > Security</li>
        <li>Click "Enable Two-Factor Authentication"</li>
        <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
        <li>Scan the QR code with your app</li>
        <li>Enter the verification code</li>
        <li>Save your backup codes in a secure location</li>
      </ol>
    `,
    category: 'Account Management',
    tags: ['password', 'security', '2fa', 'authentication'],
    author: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com'
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    views: 987,
    helpful: 67,
    notHelpful: 8,
    verified: true
  },
  'office-installation': {
    id: '3',
    slug: 'office-installation',
    title: 'Installing Microsoft Office 365',
    content: `
      <h2>Microsoft Office 365 Installation Guide</h2>
      <p>Complete installation guide for Microsoft Office 365 on Windows and Mac systems.</p>
      
      <h3>System Requirements</h3>
      <ul>
        <li>Windows 10/11 or macOS 10.15+</li>
        <li>4GB RAM minimum (8GB recommended)</li>
        <li>4GB available disk space</li>
        <li>Internet connection for activation</li>
      </ul>
      
      <h3>Installation Steps</h3>
      <ol>
        <li>Visit portal.office.com and sign in with your company account</li>
        <li>Click "Install Office" > "Office 365 apps"</li>
        <li>Download the installer file</li>
        <li>Run the installer as administrator</li>
        <li>Follow the installation wizard</li>
        <li>Sign in when prompted to activate</li>
      </ol>
      
      <h3>Post-Installation Setup</h3>
      <p>After installation:</p>
      <ul>
        <li>Configure your email account in Outlook</li>
        <li>Sign in to OneDrive for file sync</li>
        <li>Update to the latest version</li>
        <li>Configure backup preferences</li>
      </ul>
    `,
    category: 'Software Issues',
    tags: ['office365', 'installation', 'microsoft', 'productivity'],
    author: {
      name: 'Mike Wilson',
      email: 'mike.wilson@company.com'
    },
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-22T10:15:00Z',
    views: 756,
    helpful: 45,
    notHelpful: 5,
    verified: true
  }
};

// GET /knowledge/:slug - Get a specific knowledge article
router.get('/:slug', authenticateJWT, async (req, res) => {
  try {
    const { slug } = req.params;
    
    const article = mockArticles[slug];
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Increment view count (in a real system, this would update the database)
    article.views += 1;

    res.json({
      success: true,
      ...article
    });

  } catch (error) {
    console.error('Error fetching knowledge article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article'
    });
  }
});

// POST /knowledge/:id/feedback - Submit feedback for an article
router.post('/:id/feedback', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!['helpful', 'not-helpful'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feedback type'
      });
    }

    // Find article by ID (in a real system, this would update the database)
    const article = Object.values(mockArticles).find(a => a.id === id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Update feedback count
    if (type === 'helpful') {
      article.helpful += 1;
    } else {
      article.notHelpful += 1;
    }

    res.json({
      success: true,
      message: 'Feedback recorded',
      helpful: article.helpful,
      notHelpful: article.notHelpful
    });

  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback'
    });
  }
});

export default router;