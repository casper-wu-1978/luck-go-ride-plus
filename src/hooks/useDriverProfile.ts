
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { DriverProfile } from "@/types/profile";

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

  // 從資料庫載入司機個人資料
  const loadDriverProfile = async () => {
    if (!liffProfile?.userId) {
      console.error('LIFF profile or userId not available');
      return;
    }

    try {
      console.log('Loading driver profile for LINE user:', liffProfile.userId);
      
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('line_user_id', liffProfile.userId)
        .maybeSingle();

      if (error) {
        console.error('載入司機個人資料錯誤:', error);
        toast({
          title: "載入失敗",
          description: `載入個人資料時發生錯誤: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Driver profile data from database:', data);

      if (data) {
        const driverProfile: DriverProfile = {
          id: data.id,
          line_user_id: data.line_user_id || liffProfile.userId,
          name: data.name || liffProfile.displayName || "",
          phone: data.phone || "",
          email: data.email || "",
          vehicle_type: data.vehicle_type || "",
          vehicle_brand: data.vehicle_brand || "",
          vehicle_color: data.vehicle_color || "",
          plate_number: data.plate_number || "",
          license_number: data.license_number || "",
        };
        setProfile(driverProfile);
        setEditProfile(driverProfile);
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
    } catch (error) {
      console.error('載入司機個人資料錯誤:', error);
      toast({
        title: "載入失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      });
    }
  };

  // 使用 LIFF 資料初始化個人資料
  useEffect(() => {
    if (liffProfile && !liffLoading) {
      loadDriverProfile();
    }
  }, [liffProfile, liffLoading]);

  const handleSaveProfile = async () => {
    if (!liffProfile?.userId) {
      toast({
        title: "儲存失敗",
        description: "無法取得用戶ID",
        variant: "destructive",
      });
      return false;
    }

    if (!editProfile.name.trim()) {
      toast({
        title: "儲存失敗",
        description: "姓名不能為空",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Saving driver profile for LINE user:', liffProfile.userId);
      console.log('Driver profile data to save:', editProfile);

      const profileData = {
        line_user_id: liffProfile.userId,
        driver_id: liffProfile.userId, // 添加必需的 driver_id 欄位
        name: editProfile.name.trim(),
        phone: editProfile.phone.trim(),
        email: editProfile.email.trim(),
        vehicle_type: editProfile.vehicle_type?.trim(),
        vehicle_brand: editProfile.vehicle_brand?.trim(),
        vehicle_color: editProfile.vehicle_color?.trim(),
        plate_number: editProfile.plate_number?.trim(),
        license_number: editProfile.license_number?.trim(),
      };

      console.log('Formatted driver profile data:', profileData);

      // 檢查是否已有資料，決定是新增還是更新
      const { data: existingData, error: checkError } = await supabase
        .from('driver_profiles')
        .select('id')
        .eq('line_user_id', liffProfile.userId)
        .maybeSingle();

      if (checkError) {
        console.error('檢查現有資料錯誤:', checkError);
        throw checkError;
      }

      console.log('Existing driver data check:', existingData);

      let result;
      if (existingData) {
        // 更新現有資料
        console.log('Updating existing driver profile');
        result = await supabase
          .from('driver_profiles')
          .update(profileData)
          .eq('line_user_id', liffProfile.userId)
          .select()
          .single();
      } else {
        // 新增資料
        console.log('Inserting new driver profile');
        result = await supabase
          .from('driver_profiles')
          .insert(profileData)
          .select()
          .single();
      }

      console.log('Save driver profile result:', result);

      if (result.error) {
        console.error('儲存錯誤:', result.error);
        throw result.error;
      }

      const updatedProfile: DriverProfile = {
        id: result.data.id,
        line_user_id: result.data.line_user_id || liffProfile.userId,
        name: result.data.name || "",
        phone: result.data.phone || "",
        email: result.data.email || "",
        vehicle_type: result.data.vehicle_type || "",
        vehicle_brand: result.data.vehicle_brand || "",
        vehicle_color: result.data.vehicle_color || "",
        plate_number: result.data.plate_number || "",
        license_number: result.data.license_number || "",
      };
      
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
        description: `儲存時發生錯誤: ${error.message || '未知錯誤'}`,
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
