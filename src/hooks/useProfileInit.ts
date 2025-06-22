
import { useEffect } from "react";
import { UserProfile } from "@/types/profile";
import { LiffProfile } from "@/lib/liff";
import { ProfileService } from "@/services/profileService";
import { useToast } from "@/hooks/use-toast";

interface UseProfileInitProps {
  liffProfile: LiffProfile | null;
  liffLoading: boolean;
  setProfile: (profile: UserProfile) => void;
  setEditProfile: (profile: UserProfile) => void;
}

export const useProfileInit = ({
  liffProfile,
  liffLoading,
  setProfile,
  setEditProfile,
}: UseProfileInitProps) => {
  const { toast } = useToast();

  const initializeProfile = (displayName?: string, userId?: string): UserProfile => {
    return {
      line_user_id: userId || "",
      name: displayName || "",
      phone: "",
      email: "",
      business_name: "",
      business_address: "",
    };
  };

  const loadProfile = async () => {
    if (!liffProfile?.userId) {
      console.error('LIFF profile or userId not available');
      return;
    }

    try {
      const profileData = await ProfileService.loadProfile(liffProfile.userId);
      
      if (profileData) {
        setProfile(profileData);
        setEditProfile(profileData);
      } else {
        // Initialize with LIFF data if no database record
        const initialProfile = initializeProfile(liffProfile.displayName, liffProfile.userId);
        setProfile(initialProfile);
        setEditProfile(initialProfile);
      }
    } catch (error) {
      console.error('載入個人資料錯誤:', error);
      toast({
        title: "載入失敗",
        description: error instanceof Error ? error.message : "發生未知錯誤",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (liffProfile && !liffLoading) {
      loadProfile();
    }
  }, [liffProfile, liffLoading]);
};
