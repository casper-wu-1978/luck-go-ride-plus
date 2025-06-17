
import React, { useEffect, useState } from 'react';
import { useLiff } from '@/contexts/LiffContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { profile, isLoading, isLiffReady } = useLiff();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-800 text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  if (!isLiffReady || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🚗</div>
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">Luck Go</h1>
          <p className="text-emerald-600 mb-6">您的專屬叫車平台</p>
          <div className="bg-white rounded-lg shadow-xl p-6">
            <p className="text-gray-800 mb-4">請在 LINE 應用程式中開啟此服務</p>
            <p className="text-sm text-gray-600">此應用程式需要透過 LINE 登入才能使用</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
