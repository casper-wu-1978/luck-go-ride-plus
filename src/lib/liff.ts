
import liff from '@line/liff';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export const initializeLiff = async (): Promise<boolean> => {
  try {
    // LIFF ID from LINE Developers Console
    await liff.init({ liffId: '2007590095-84XDyloy' });
    
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
