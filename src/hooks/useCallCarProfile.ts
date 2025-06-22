
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/profile";

export const useCallCarProfile = () => {
  const { profile: liffProfile } = useLiff();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loadUserProfile = async () => {
    if (!liffProfile?.userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('line_user_id', liffProfile.userId)
        .maybeSingle();

      if (error) {
        console.error('載入個人資料錯誤:', error);
        setUserProfile({
          name: liffProfile.displayName || "用戶",
          phone: "",
          email: "",
          business_name: "",
          business_address: ""
        });
        return;
      }

      if (data) {
        setUserProfile({
          name: data.name || liffProfile.displayName || "用戶",
          phone: data.phone || "",
          email: data.email || "",
          business_name: data.business_name || "",
          business_address: data.business_address || ""
        });
      } else {
        setUserProfile({
          name: liffProfile.displayName || "用戶",
          phone: "",
          email: "",
          business_name: "",
          business_address: ""
        });
      }
    } catch (error) {
      console.error('載入個人資料錯誤:', error);
      setUserProfile({
        name: liffProfile.displayName || "用戶",
        phone: "",
        email: "",
        business_name: "",
        business_address: ""
      });
    }
  };

  useEffect(() => {
    if (liffProfile?.userId) {
      loadUserProfile();
    }
  }, [liffProfile]);

  return { userProfile };
};
