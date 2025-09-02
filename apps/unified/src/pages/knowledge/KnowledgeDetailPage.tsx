import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  PencilIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ShareIcon,
  PrinterIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { usePageContext } from '@hooks/usePageContext';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  views: number;
  helpful: number;
  notHelpful: number;
  verified: boolean;
}

export default function KnowledgeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setPageContext } = usePageContext();
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first
        try {
          const response = await fetch(`/api/knowledge/${slug}`);
          if (response.ok) {
            const data = await response.json();
            setArticle(data);
            
            // Set page context for AI
            setPageContext({
              type: 'knowledge',
              title: data.title,
              content: data.content,
              metadata: {
                id: data.id,
                slug: data.slug,
                category: data.category,
                tags: data.tags,
                author: data.author.name,
                lastUpdated: data.updatedAt,
                url: `/knowledge/${slug}`
              }
            });
            return;
          }
        } catch (apiError) {
          console.warn('Knowledge API not available, using mock data');
        }

        // Fallback to mock data for demo
        const mockArticle: KnowledgeArticle = {
          id: '1',
          slug: slug,
          title: getArticleTitleFromSlug(slug),
          content: getMockArticleContent(slug),
          category: 'Getting Started',
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
        };

        setArticle(mockArticle);
        
        // Set page context for AI
        setPageContext({
          type: 'knowledge',
          title: mockArticle.title,
          content: mockArticle.content,
          metadata: {
            id: mockArticle.id,
            slug: mockArticle.slug,
            category: mockArticle.category,
            tags: mockArticle.tags,
            author: mockArticle.author.name,
            lastUpdated: mockArticle.updatedAt,
            url: `/knowledge/${slug}`
          }
        });

      } catch (err) {
        setError('Failed to load article');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug, setPageContext]);

  const getArticleTitleFromSlug = (slug: string): string => {
    const titleMap: { [key: string]: string } = {
      'vpn-setup': 'How to Connect to Company VPN',
      'password-reset': 'Password Reset Guide',
      'office-installation': 'Installing Microsoft Office 365',
      'printer-setup': 'Printer Setup and Troubleshooting',
      'email-mobile': 'Email Configuration for Mobile Devices'
    };
    return titleMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getMockArticleContent = (slug: string): string => {
    const contentMap: { [key: string]: string } = {
      'vpn-setup': `
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
      'password-reset': `
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
      `
    };
    
    return contentMap[slug] || `
      <h2>${getArticleTitleFromSlug(slug)}</h2>
      <p>This article provides information about ${getArticleTitleFromSlug(slug).toLowerCase()}.</p>
      <p>For more detailed information, please contact the IT support team.</p>
    `;
  };

  const handleFeedback = async (type: 'helpful' | 'not-helpful') => {
    if (!article) return;
    
    setUserFeedback(type);
    
    // Send feedback to API (if available)
    try {
      await fetch(`/api/knowledge/${article.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, articleId: article.id })
      });
    } catch (error) {
      console.warn('Feedback API not available');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <h2 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">
          Article Not Found
        </h2>
        <p className="text-red-700 dark:text-red-300">
          {error || 'The requested article could not be found.'}
        </p>
        <button
          onClick={() => navigate('/knowledge')}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Return to Knowledge Base
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              {article.category}
            </span>
            {article.verified && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-300">
                ✓ Verified
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {article.title}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span>{article.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpenIcon className="h-4 w-4" />
              <span>{article.views} views</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
            <ShareIcon className="h-4 w-4" />
            Share
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
            <PrinterIcon className="h-4 w-4" />
            Print
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
            <PencilIcon className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="card p-8">
        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="card p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <TagIcon className="h-5 w-5" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold">Was this article helpful?</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleFeedback('helpful')}
            disabled={userFeedback !== null}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
              userFeedback === 'helpful'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <ThumbsUpIcon className="h-4 w-4" />
            Yes ({article.helpful})
          </button>
          <button
            onClick={() => handleFeedback('not-helpful')}
            disabled={userFeedback !== null}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
              userFeedback === 'not-helpful'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                : 'border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <ThumbsDownIcon className="h-4 w-4" />
            No ({article.notHelpful})
          </button>
        </div>
        {userFeedback && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Thank you for your feedback! {userFeedback === 'helpful' ? '😊' : 'We\'ll work to improve this article.'}
          </p>
        )}
      </div>

      {/* AI Assistant Prompt */}
      <div className="card border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-600 p-2">
            <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
              Need help with this article?
            </h3>
            <p className="mb-3 text-sm text-blue-800 dark:text-blue-200">
              Our AI assistant Cosmo can help you understand this content better or answer related questions.
            </p>
            <button
              onClick={() => navigate('/cosmo')}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Ask Cosmo AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}