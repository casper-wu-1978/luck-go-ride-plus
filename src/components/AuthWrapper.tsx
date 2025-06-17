
import React, { useEffect, useState } from 'react';
import { useLiff } from '@/contexts/LiffContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLocation } from 'react-router-dom';
import AuthPage from './AuthPage';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { profile, isLoading, isLiffReady } = useLiff();
  const { userRole } = useUserRole();
  const location = useLocation();
  const [showDevInfo, setShowDevInfo] = useState(false);

  // 檢測是否為開發環境
  const isDevelopment = import.meta.env.DEV || 
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('lovableproject.com') ||
    window.location.hostname.includes('lovable.app');

  // 檢查是否在管理員頁面
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isDevelopment) {
      setShowDevInfo(true);
    }
  }, [isDevelopment]);

  // 如果是管理員路由，使用 email 認證
  if (isAdminRoute) {
    return <AuthPage />;
  }

  // 對於商家和司機，使用 LIFF 認證
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-800 text-lg">載入中...</p>
          {showDevInfo && (
            <p className="text-sm text-emerald-600 mt-2">開發模式：正在初始化...</p>
          )}
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
            {isDevelopment ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-medium mb-2">🛠️ 開發模式</p>
                  <p className="text-blue-700 text-sm">
                    此應用程式目前在開發模式運行。在正式環境中，請在 LINE 應用程式中開啟此服務。
                  </p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  重新載入
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-800 mb-4">請在 LINE 應用程式中開啟此服務</p>
                <p className="text-sm text-gray-600 mb-4">
                  此應用程式需要透過 LINE 登入才能使用
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    💡 如果遇到連線問題，請嘗試：<br/>
                    1. 確認網路連線正常<br/>
                    2. 重新啟動 LINE 應用程式<br/>
                    3. 在外部瀏覽器中開啟
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
