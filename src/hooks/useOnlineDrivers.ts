
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOnlineDrivers } from "@/utils/driverMatching";

export const useOnlineDrivers = () => {
  const [onlineDriversCount, setOnlineDriversCount] = useState(0);

  const loadOnlineDriversCount = async () => {
    try {
      const onlineDrivers = await getOnlineDrivers();
      setOnlineDriversCount(onlineDrivers.length);
      console.log('載入線上司機數量:', onlineDrivers.length);
    } catch (error) {
      console.error('載入線上司機數量錯誤:', error);
    }
  };

  // 監聽司機狀態變化
  useEffect(() => {
    loadOnlineDriversCount();

    const channel = supabase
      .channel('driver_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_profiles'
        },
        (payload) => {
          console.log('司機狀態變化:', payload);
          loadOnlineDriversCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    onlineDriversCount,
    loadOnlineDriversCount,
  };
};
