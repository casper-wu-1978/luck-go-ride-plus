
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
        console.log('開始初始化 LIFF...');
        const startTime = Date.now();
        
        const liffInitialized = await initializeLiff();
        
        const initTime = Date.now() - startTime;
        console.log(`LIFF 初始化耗時: ${initTime}ms`);
        
        if (liffInitialized) {
          console.log('開始獲取用戶資料...');
          const profileStartTime = Date.now();
          
          const userProfile = await getLiffProfile();
          
          const profileTime = Date.now() - profileStartTime;
          console.log(`用戶資料獲取耗時: ${profileTime}ms`);
          
          setProfile(userProfile);
          setIsLiffReady(true);
          console.log('LIFF 完全初始化完成');
        } else {
          console.log('LIFF 初始化失敗，但繼續載入應用');
        }
      } catch (error) {
        console.error('LIFF initialization error:', error);
      } finally {
        setIsLoading(false);
        console.log('LIFF 載入狀態設為完成');
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
