
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/profile";

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

  // 從資料庫載入個人資料
  const loadProfile = async () => {
    if (!liffProfile?.userId) {
      console.error('LIFF profile or userId not available');
      return;
    }

    try {
      console.log('Loading profile for LINE user:', liffProfile.userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('line_user_id', liffProfile.userId)
        .maybeSingle();

      if (error) {
        console.error('載入個人資料錯誤:', error);
        toast({
          title: "載入失敗",
          description: `載入個人資料時發生錯誤: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Profile data from database:', data);

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          line_user_id: data.line_user_id || liffProfile.userId,
          name: data.name || liffProfile.displayName || "",
          phone: data.phone || "",
          email: data.email || "",
          business_name: data.business_name || "",
          business_address: data.business_address || "",
        };
        setProfile(userProfile);
        setEditProfile(userProfile);
      } else {
        // 如果資料庫中沒有資料，使用 LIFF 資料初始化
        const userProfile: UserProfile = {
          line_user_id: liffProfile.userId,
          name: liffProfile.displayName || "",
          phone: "",
          email: "",
          business_name: "",
          business_address: "",
        };
        setProfile(userProfile);
        setEditProfile(userProfile);
      }
    } catch (error) {
      console.error('載入個人資料錯誤:', error);
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
      loadProfile();
    }
  }, [liffProfile, liffLoading]);

  const handleSaveProfile = async () => {
    if (!liffProfile?.userId) {
      toast({
        title: "儲存失敗",
        description: "無法取得用戶ID",
        variant: "destructive",
      });
      return;
    }

    if (!editProfile.name.trim()) {
      toast({
        title: "儲存失敗",
        description: "姓名不能為空",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving profile for LINE user:', liffProfile.userId);
      console.log('Profile data to save:', editProfile);

      const profileData = {
        line_user_id: liffProfile.userId,
        name: editProfile.name.trim(),
        phone: editProfile.phone.trim(),
        email: editProfile.email.trim(),
        business_name: editProfile.business_name.trim(),
        business_address: editProfile.business_address.trim(),
        user_id: null, // 明確設置為 null，因為我們使用 line_user_id
      };

      console.log('Formatted profile data:', profileData);

      // 檢查是否已有資料，決定是新增還是更新
      const { data: existingData, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('line_user_id', liffProfile.userId)
        .maybeSingle();

      if (checkError) {
        console.error('檢查現有資料錯誤:', checkError);
        throw checkError;
      }

      console.log('Existing data check:', existingData);

      let result;
      if (existingData) {
        // 更新現有資料
        console.log('Updating existing profile');
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('line_user_id', liffProfile.userId)
          .select()
          .single();
      } else {
        // 新增資料
        console.log('Inserting new profile');
        result = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
      }

      console.log('Save result:', result);

      if (result.error) {
        console.error('儲存錯誤:', result.error);
        throw result.error;
      }

      const updatedProfile: UserProfile = {
        id: result.data.id,
        line_user_id: result.data.line_user_id || liffProfile.userId,
        name: result.data.name || "",
        phone: result.data.phone || "",
        email: result.data.email || "",
        business_name: result.data.business_name || "",
        business_address: result.data.business_address || "",
      };
      
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
