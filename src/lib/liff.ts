
import liff from '@line/liff';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export const initializeLiff = async (): Promise<boolean> => {
  try {
    // LIFF ID 需要從 LINE Developers Console 獲取
    await liff.init({ liffId: '1234567890-abcdefgh' }); // 請替換為實際的 LIFF ID
    
    if (!liff.isLoggedIn()) {
      liff.login();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('LIFF initialization failed:', error);
    return false;
  }
};

export const getLiffProfile = async (): Promise<LiffProfile | null> => {
  try {
    if (!liff.isLoggedIn()) {
      return null;
    }
    
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (error) {
    console.error('Failed to get LIFF profile:', error);
    return null;
  }
};

export const closeLiff = () => {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
};

export default liff;
