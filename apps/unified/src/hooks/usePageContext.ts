import { createContext, useContext, useState, useEffect } from 'react';

export interface PageContextData {
  type: 'knowledge' | 'ticket' | 'dashboard' | 'other';
  title: string;
  content?: string;
  metadata?: {
    id?: string;
    slug?: string;
    category?: string;
    tags?: string[];
    author?: string;
    lastUpdated?: string;
    url?: string;
  };
}

interface PageContextType {
  pageContext: PageContextData | null;
  setPageContext: (context: PageContextData | null) => void;
  updatePageContext: (updates: Partial<PageContextData>) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageContextProvider');
  }
  return context;
};

export const usePageContextProvider = () => {
  const [pageContext, setPageContext] = useState<PageContextData | null>(null);

  const updatePageContext = (updates: Partial<PageContextData>) => {
    setPageContext(prev => prev ? { ...prev, ...updates } : null);
  };

  // Auto-detect page context based on URL changes
  useEffect(() => {
    const detectPageContext = () => {
      const path = window.location.pathname;
      const title = document.title;
      
      // Knowledge base article detection
      if (path.startsWith('/knowledge/')) {
        const slug = path.split('/knowledge/')[1];
        if (slug && slug !== '') {
          setPageContext({
            type: 'knowledge',
            title: title,
            metadata: {
              slug: slug,
              url: path
            }
          });
          return;
        }
      }
      
      // Ticket detail detection
      if (path.startsWith('/tickets/') && path.split('/').length > 2) {
        const ticketId = path.split('/tickets/')[1];
        if (ticketId && ticketId !== '') {
          setPageContext({
            type: 'ticket',
            title: title,
            metadata: {
              id: ticketId,
              url: path
            }
          });
          return;
        }
      }
      
      // Dashboard detection
      if (path === '/dashboard' || path === '/') {
        setPageContext({
          type: 'dashboard',
          title: title,
          metadata: {
            url: path
          }
        });
        return;
      }
      
      // Default other page
      setPageContext({
        type: 'other',
        title: title,
        metadata: {
          url: path
        }
      });
    };

    // Initial detection
    detectPageContext();

    // Listen for route changes
    const handlePopState = () => {
      detectPageContext();
    };

    window.addEventListener('popstate', handlePopState);
    
    // Listen for pushState/replaceState (for SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(detectPageContext, 0);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(detectPageContext, 0);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return {
    pageContext,
    setPageContext,
    updatePageContext
  };
};

export { PageContext };