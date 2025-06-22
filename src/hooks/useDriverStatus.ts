
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDriverStatus = () => {
  const { profile } = useLiff();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");

  useEffect(() => {
    checkDriverStatus();
    loadMapboxToken();
  }, []);

  const checkDriverStatus = async () => {
    if (!profile?.userId) return;

    try {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('status')
        .eq('line_user_id', profile.userId)
        .maybeSingle();

      if (error) {
        console.error('檢查司機狀態錯誤:', error);
        return;
      }

      if (data && data.status === 'online') {
        setIsOnline(true);
      }
    } catch (error) {
      console.error('檢查司機狀態錯誤:', error);
    }
  };

  const loadMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) {
        console.error('無法獲取 Mapbox token:', error);
        return;
      }
      setMapboxToken(data.token);
    } catch (error) {
      console.error('載入 Mapbox token 錯誤:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (!mapboxToken) {
      toast({
        title: "定位失敗",
        description: "Mapbox 服務尚未初始化",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        });
      });

      const { latitude, longitude } = position.coords;
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&language=zh-TW`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setCurrentLocation(data.features[0].place_name);
        } else {
          setCurrentLocation(`緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`);
        }
      } else {
        setCurrentLocation(`緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`);
      }

      toast({
        title: "定位成功",
        description: "已獲取您的當前位置",
      });
    } catch (error) {
      console.error('定位錯誤:', error);
      setCurrentLocation("無法獲取位置");
      toast({
        title: "定位失敗",
        description: "請檢查定位權限設定",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const updateDriverStatus = async (status: 'online' | 'offline') => {
    if (!profile?.userId) {
      console.error('無法取得用戶ID');
      return;
    }

    try {
      console.log('更新司機狀態:', { userId: profile.userId, status });

      // 檢查是否已有司機資料
      const { data: existingDriver, error: checkError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('line_user_id', profile.userId)
        .maybeSingle();

      if (checkError) {
        console.error('檢查司機資料錯誤:', checkError);
        throw checkError;
      }

      if (!existingDriver) {
        console.log('創建新司機資料');
        // 創建新司機資料
        const { error: insertError } = await supabase
          .from('driver_profiles')
          .insert({
            line_user_id: profile.userId,
            driver_id: profile.userId,
            name: profile.displayName || '司機',
            status: status,
            vehicle_type: '一般車輛',
            vehicle_brand: 'Toyota',
            vehicle_color: '白色',
            plate_number: 'ABC-1234'
          });

        if (insertError) {
          console.error('創建司機資料錯誤:', insertError);
          throw insertError;
        }
      } else {
        console.log('更新現有司機狀態');
        // 更新司機狀態
        const { error: updateError } = await supabase
          .from('driver_profiles')
          .update({ 
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('line_user_id', profile.userId);

        if (updateError) {
          console.error('更新司機狀態錯誤:', updateError);
          throw updateError;
        }
      }

      console.log('司機狀態更新成功:', status);
    } catch (error) {
      console.error('更新司機狀態失敗:', error);
      throw error;
    }
  };

  const handleOnlineToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await getCurrentLocation();
      }
      
      await updateDriverStatus(checked ? 'online' : 'offline');
      setIsOnline(checked);
      
      toast({
        title: checked ? "已上線" : "已下線",
        description: checked ? "開始接收訂單通知" : "停止接收訂單通知",
      });
    } catch (error) {
      console.error('切換狀態失敗:', error);
      toast({
        title: "狀態更新失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
    }
  };

  return {
    isOnline,
    currentLocation,
    isGettingLocation,
    getCurrentLocation,
    handleOnlineToggle
  };
};
