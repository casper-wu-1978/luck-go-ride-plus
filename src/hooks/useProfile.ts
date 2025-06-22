
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { UserProfile } from "@/types/profile";
import { ProfileService } from "@/services/profileService";
import { ProfileValidation } from "@/utils/profileValidation";
import { useProfileInit } from "@/hooks/useProfileInit";

export const useProfile = () => {
  const { profile: liffProfile, isLoading: liffLoading } = useLiff();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    phone: "",
    email: "",
    business_name: "",
    business_address: "",
  });
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize profile data
  useProfileInit({
    liffProfile,
    liffLoading,
    setProfile,
    setEditProfile,
  });

  const handleSaveProfile = async (): Promise<boolean> => {
    if (!liffProfile?.userId) {
      toast({
        title: "儲存失敗",
        description: "無法取得用戶ID",
        variant: "destructive",
      });
      return false;
    }

    // Validate profile
    const validation = ProfileValidation.validateProfile(editProfile);
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
      const updatedProfile = await ProfileService.saveProfile(liffProfile.userId, editProfile);
      setProfile(updatedProfile);
      
      toast({
        title: "更新成功",
        description: "個人資料已儲存至資料庫",
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
