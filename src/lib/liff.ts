
import liff from '@line/liff';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// 檢測是否為開發環境
const isDevelopment = import.meta.env.DEV || 
  window.location.hostname === 'localhost' || 
  window.location.hostname.includes('lovableproject.com') ||
  window.location.hostname.includes('lovable.app');

// 開發模式的模擬資料
const mockProfile: LiffProfile = {
  userId: 'U12345678901234567890123456789012',
  displayName: '測試用戶',
  pictureUrl: 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=Test',
  statusMessage: '開發模式測試用戶'
};

export const initializeLiff = async (): Promise<boolean> => {
  try {
    if (isDevelopment) {
      console.log('開發模式：跳過 LIFF 初始化，使用模擬資料');
      return true;
    }

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
    if (isDevelopment) {
      console.log('開發模式：LIFF 初始化失敗，使用模擬資料');
      return true;
    }
    
    // 如果是連線錯誤，嘗試使用外部瀏覽器
    console.log('嘗試在外部瀏覽器中開啟');
    if (liff.isInClient()) {
      liff.openWindow({
        url: window.location.href,
        external: true
      });
    }
    return false;
  }
};

export const getLiffProfile = async (): Promise<LiffProfile | null> => {
  try {
    if (isDevelopment) {
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
    if (isDevelopment) {
      console.log('開發模式：發生錯誤，使用模擬資料');
      return mockProfile;
    }
    return null;
  }
};

export const closeLiff = () => {
  if (isDevelopment) {
    console.log('開發模式：模擬關閉 LIFF');
    return;
  }

  if (liff.isInClient()) {
    liff.closeWindow();
  } else {
    window.close();
  }
};

export const isInLineApp = () => {
  if (isDevelopment) {
    return false;
  }
  return liff.isInClient();
};

export default liff;
