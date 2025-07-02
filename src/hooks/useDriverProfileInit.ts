
import { useEffect } from "react";
import { DriverProfile } from "@/types/profile";
import { DriverProfileService } from "@/services/driverProfileService";
import { LiffProfile } from "@/lib/liff";

interface UseDriverProfileInitProps {
  liffProfile: LiffProfile | null;
  liffLoading: boolean;
  setProfile: (profile: DriverProfile) => void;
  setEditProfile: (profile: DriverProfile) => void;
  onError: (message: string) => void;
}

export const useDriverProfileInit = ({
  liffProfile,
  liffLoading,
  setProfile,
  setEditProfile,
  onError
}: UseDriverProfileInitProps) => {
  const loadDriverProfile = async () => {
    if (!liffProfile?.userId) {
      console.error('LIFF profile or userId not available');
      return;
    }

    try {
      console.log('🔍 初始化司機資料，LINE 用戶:', {
        userId: liffProfile.userId,
        displayName: liffProfile.displayName,
        pictureUrl: liffProfile.pictureUrl
      });

      // First ensure the driver profile exists with LINE info
      await DriverProfileService.ensureDriverProfileExists(
        liffProfile.userId, 
        liffProfile.displayName || '司機',
        liffProfile.pictureUrl
      );

      // Then load the profile data
      const data = await DriverProfileService.loadProfile(liffProfile.userId);

      if (data) {
        console.log('✅ 司機資料載入成功:', data);
        setProfile(data);
        setEditProfile(data);
      } else {
        // If still no data after ensuring it exists, create default profile
        const driverProfile: DriverProfile = {
          line_user_id: liffProfile.userId,
          name: liffProfile.displayName || "",
          phone: "",
          email: "",
          vehicle_type: "",
          vehicle_brand: "",
          vehicle_color: "",
          plate_number: "",
          license_number: "",
        };
        setProfile(driverProfile);
        setEditProfile(driverProfile);
      }
    } catch (error: any) {
      console.error('載入司機個人資料錯誤:', error);
      onError(error.message || "發生未知錯誤");
    }
  };

  useEffect(() => {
    if (liffProfile && !liffLoading) {
      loadDriverProfile();
    }
  }, [liffProfile, liffLoading]);
};
