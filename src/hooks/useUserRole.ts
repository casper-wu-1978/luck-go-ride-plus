
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'driver' | 'admin' | 'merchant' | null;

export const useUserRole = () => {
  const { profile: liffProfile, isLoading: liffLoading } = useLiff();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!liffProfile?.userId || liffLoading) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('line_user_id', liffProfile.userId)
          .single();

        if (error) {
          console.error('獲取用戶角色錯誤:', error);
          setUserRole(null);
        } else {
          setUserRole(data?.role || null);
        }
      } catch (error) {
        console.error('獲取用戶角色錯誤:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [liffProfile, liffLoading]);

  return { userRole, isLoading };
};
