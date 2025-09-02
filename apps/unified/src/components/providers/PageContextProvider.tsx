import React from 'react';
import { PageContext, usePageContextProvider } from '../hooks/usePageContext';

interface PageContextProviderProps {
  children: React.ReactNode;
}

export const PageContextProvider: React.FC<PageContextProviderProps> = ({ children }) => {
  const contextValue = usePageContextProvider();

  return (
    <PageContext.Provider value={contextValue}>
      {children}
    </PageContext.Provider>
  );
};