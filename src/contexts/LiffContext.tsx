
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeLiff, getLiffProfile, LiffProfile } from '@/lib/liff';

interface LiffContextType {
  profile: LiffProfile | null;
  isLoading: boolean;
  isLiffReady: boolean;
}

const LiffContext = createContext<LiffContextType | undefined>(undefined);

export const useLiff = () => {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error('useLiff must be used within a LiffProvider');
  }
  return context;
};

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiffReady, setIsLiffReady] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffInitialized = await initializeLiff();
        
        if (liffInitialized) {
          const userProfile = await getLiffProfile();
          setProfile(userProfile);
          setIsLiffReady(true);
        }
      } catch (error) {
        console.error('LIFF initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, []);

  const value = {
    profile,
    isLoading,
    isLiffReady,
  };

  return (
    <LiffContext.Provider value={value}>
      {children}
    </LiffContext.Provider>
  );
};
