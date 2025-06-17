
import liff from '@line/liff';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// 更精確的環境檢測
const isDevelopment = () => {
  // 如果在 LINE 應用內，一定是正式環境
  if (typeof window !== 'undefined' && window.location.href.includes('line://')) {
    return false;
  }
  
  // 檢查是否在 LIFF 環境中
  if (typeof liff !== 'undefined' && liff.isInClient && liff.isInClient()) {
    return false;
  }
  
  // 只有在明確的開發環境才使用模擬模式
  return import.meta.env.DEV && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname.includes('127.0.0.1'));
};

// 開發模式的模擬資料
const mockProfile: LiffProfile = {
  userId: 'U12345678901234567890123456789012',
  displayName: '測試用戶',
  pictureUrl: 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=Test',
  statusMessage: '開發模式測試用戶'
};

export const initializeLiff = async (): Promise<boolean> => {
  try {
    const isDevMode = isDevelopment();
    
    if (isDevMode) {
      console.log('開發模式：跳過 LIFF 初始化，使用模擬資料');
      return true;
    }

    console.log('正式環境：初始化 LIFF');
    
    // LIFF ID from LINE Developers Console
    await liff.init({ 
      liffId: '2007590095-84XDyloy',
      withLoginOnExternalBrowser: true  // 允許外部瀏覽器登入
    });
    
    if (!liff.isLoggedIn()) {
      console.log('用戶未登入，開始登入流程');
      liff.login({
        redirectUri: window.location.href
      });
      return false;
    }
    
    console.log('LIFF 初始化成功，用戶已登入');
    return true;
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    
    // 只有在開發模式下才回退到模擬資料
    if (isDevelopment()) {
      console.log('開發模式：LIFF 初始化失敗，使用模擬資料');
      return true;
    }
    
    // 正式環境下的錯誤處理
    console.log('正式環境：LIFF 初始化失敗');
    if (liff.isInClient && liff.isInClient()) {
      // 在 LINE 內部，嘗試重新登入
      try {
        liff.login({
          redirectUri: window.location.href
        });
      } catch (loginError) {
        console.error('登入失敗:', loginError);
      }
    } else {
      // 在外部瀏覽器，建議用戶在 LINE 中開啟
      console.log('請在 LINE 應用程式中開啟此服務');
    }
    
    return false;
  }
};

export const getLiffProfile = async (): Promise<LiffProfile | null> => {
  try {
    const isDevMode = isDevelopment();
    
    if (isDevMode) {
      console.log('開發模式：返回模擬用戶資料');
      return mockProfile;
    }

    if (!liff.isLoggedIn()) {
      console.log('用戶未登入，無法取得個人資料');
      return null;
    }
    
    const profile = await liff.getProfile();
    console.log('成功取得 LINE 用戶資料:', profile);
    
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error('Failed to get LIFF profile:', error);
    
    // 只有在開發模式下才回退到模擬資料
    if (isDevelopment()) {
      console.log('開發模式：發生錯誤，使用模擬資料');
      return mockProfile;
    }
    
    return null;
  }
};

export const closeLiff = () => {
  if (isDevelopment()) {
    console.log('開發模式：模擬關閉 LIFF');
    return;
  }

  if (liff.isInClient && liff.isInClient()) {
    liff.closeWindow();
  } else {
    window.close();
  }
};

export const isInLineApp = () => {
  if (isDevelopment()) {
    return false;
  }
  return liff.isInClient && liff.isInClient();
};

// 檢查是否為開發模式的輔助函數
export const isDevMode = isDevelopment;

export default liff;
