
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
      const data = await DriverProfileService.loadProfile(liffProfile.userId);

      if (data) {
        setProfile(data);
        setEditProfile(data);
      } else {
        // 如果資料庫中沒有資料，使用 LIFF 資料初始化
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
