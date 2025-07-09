'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading, loadingMessage, setLoadingMessage }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
