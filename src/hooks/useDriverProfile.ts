
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { DriverProfile } from "@/types/profile";
import { DriverProfileService } from "@/services/driverProfileService";
import { DriverProfileValidation } from "@/utils/driverProfileValidation";
import { useDriverProfileInit } from "@/hooks/useDriverProfileInit";

export const useDriverProfile = () => {
  const { profile: liffProfile, isLoading: liffLoading } = useLiff();
  const [profile, setProfile] = useState<DriverProfile>({
    name: "",
    phone: "",
    email: "",
    vehicle_type: "",
    vehicle_brand: "",
    vehicle_color: "",
    plate_number: "",
    license_number: "",
  });
  const [editProfile, setEditProfile] = useState<DriverProfile>(profile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleError = (message: string) => {
    toast({
      title: "載入失敗",
      description: message,
      variant: "destructive",
    });
  };

  // Initialize profile using the custom hook
  useDriverProfileInit({
    liffProfile,
    liffLoading,
    setProfile,
    setEditProfile,
    onError: handleError
  });

  const handleSaveProfile = async () => {
    if (!liffProfile?.userId) {
      toast({
        title: "儲存失敗",
        description: "無法取得用戶ID",
        variant: "destructive",
      });
      return false;
    }

    const validation = DriverProfileValidation.validateProfile(editProfile);
    if (!validation.isValid) {
      toast({
        title: "儲存失敗",
        description: validation.error,
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const updatedProfile = await DriverProfileService.saveProfile(
        liffProfile.userId,
        editProfile
      );
      
      setProfile(updatedProfile);
      toast({
        title: "更新成功",
        description: "司機個人資料已儲存至資料庫",
      });
      return true;
    } catch (error: any) {
      console.error('儲存錯誤:', error);
      toast({
        title: "儲存失敗",
        description: error.message || '未知錯誤',
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile({ ...profile });
  };

  return {
    profile,
    editProfile,
    setEditProfile,
    isLoading: isLoading || liffLoading,
    handleSaveProfile,
    handleCancelEdit,
  };
};
