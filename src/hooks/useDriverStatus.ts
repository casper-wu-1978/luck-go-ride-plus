
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
    if (profile?.userId) {
      checkDriverStatus();
      loadMapboxToken();
    }
  }, [profile?.userId]);

  const checkDriverStatus = async () => {
    if (!profile?.userId) return;

    try {
      console.log('🔍 檢查司機狀態:', profile.userId);
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('status, line_user_id, name')
        .eq('line_user_id', profile.userId)
        .maybeSingle();

      if (error) {
        console.error('❌ 檢查司機狀態錯誤:', error);
        return;
      }

      if (data) {
        console.log('📊 司機資料:', {
          name: data.name,
          status: data.status,
          lineUserId: data.line_user_id?.substring(0, 10) + '...'
        });
        
        if (data.status === 'online') {
          setIsOnline(true);
          console.log('✅ 司機目前狀態: 線上');
        } else {
          console.log('📴 司機目前狀態: 離線');
        }
      } else {
        console.log('⚠️ 找不到司機資料');
      }
    } catch (error) {
      console.error('❌ 檢查司機狀態異常:', error);
    }
  };

  const loadMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) {
        console.error('❌ 無法獲取 Mapbox token:', error);
        return;
      }
      setMapboxToken(data.token);
      console.log('✅ Mapbox token 載入成功');
    } catch (error) {
      console.error('❌ 載入 Mapbox token 錯誤:', error);
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
      // 檢查瀏覽器是否支援定位
      if (!navigator.geolocation) {
        throw new Error('瀏覽器不支援定位功能');
      }

      console.log('🗺️ 開始獲取位置...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            console.error('定位錯誤:', error);
            switch(error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('用戶拒絕定位權限請求'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('位置資訊無法獲取'));
                break;
              case error.TIMEOUT:
                reject(new Error('定位請求超時'));
                break;
              default:
                reject(new Error('定位發生未知錯誤'));
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 600000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('📍 獲取到座標:', { latitude, longitude });
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&language=zh-TW`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const address = data.features[0].place_name;
            setCurrentLocation(address);
            console.log('📍 地址解析成功:', address);
          } else {
            const coords = `緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`;
            setCurrentLocation(coords);
            console.log('📍 使用座標作為位置:', coords);
          }
        } else {
          const coords = `緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`;
          setCurrentLocation(coords);
          console.log('📍 地址解析失敗，使用座標:', coords);
        }
      } catch (geocodeError) {
        console.error('地址解析錯誤:', geocodeError);
        const coords = `緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`;
        setCurrentLocation(coords);
      }

      toast({
        title: "定位成功",
        description: "已獲取您的當前位置",
      });
    } catch (error) {
      console.error('❌ 定位錯誤:', error);
      setCurrentLocation("無法獲取位置");
      toast({
        title: "定位失敗",
        description: error instanceof Error ? error.message : "請檢查定位權限設定",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const sendLineNotification = async (userId: string, message: string) => {
    try {
      console.log('📤 準備發送 LINE 通知:', { userId: userId.substring(0, 10) + '...', messageLength: message.length });
      
      const { data, error } = await supabase.functions.invoke('send-line-notification', {
        body: {
          userId: userId,
          message: message
        }
      });

      if (error) {
        console.error('❌ LINE 通知發送失敗:', error);
        throw error;
      }

      console.log('✅ LINE 通知發送成功:', data);
      return data;
    } catch (error) {
      console.error('❌ 發送 LINE 通知異常:', error);
      throw error;
    }
  };

  const checkForPendingOrders = async (driverId: string) => {
    try {
      console.log(`🔍 司機 ${driverId} 檢查待接訂單...`);
      
      const { data: pendingOrders, error } = await supabase
        .from('call_records')
        .select('id, car_type_label, favorite_type, favorite_info, created_at')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ 檢查待接訂單錯誤:', error);
        toast({
          title: "檢查訂單失敗",
          description: "無法檢查待接訂單",
          variant: "destructive",
        });
        return;
      }

      console.log(`📋 找到 ${pendingOrders?.length || 0} 筆待接訂單`);

      if (pendingOrders && pendingOrders.length > 0) {
        console.log(`🔔 發現 ${pendingOrders.length} 筆待接訂單，準備發送通知...`);
        
        let message = `🚗 司機上線通知！\n\n目前有 ${pendingOrders.length} 筆待接訂單：\n\n`;
        
        pendingOrders.slice(0, 3).forEach((order, index) => {
          const location = order.favorite_type === 'code' ? `代碼: ${order.favorite_info}` : 
                          order.favorite_type === 'address' ? `地址: ${order.favorite_info}` : '現在位置';
          message += `${index + 1}. ${order.car_type_label} - ${location}\n`;
        });
        
        if (pendingOrders.length > 3) {
          message += `... 還有 ${pendingOrders.length - 3} 筆訂單\n`;
        }
        
        message += '\n請查看司機頁面接單！';

        console.log('📝 準備發送的訊息內容:', message);

        try {
          await sendLineNotification(driverId, message);
          console.log('✅ 司機上線通知發送成功');
          
          toast({
            title: "通知已發送",
            description: `已通知您有 ${pendingOrders.length} 筆待接訂單`,
          });
        } catch (notificationError) {
          console.error('❌ 發送 LINE 通知失敗:', notificationError);
          toast({
            title: "通知發送失敗", 
            description: "LINE 通知服務異常，但您仍可查看待接訂單",
            variant: "destructive",
          });
        }
      } else {
        console.log('📭 目前沒有待接訂單');
        toast({
          title: "已上線",
          description: "目前沒有待接訂單",
        });
      }
    } catch (error) {
      console.error('❌ 檢查待接訂單失敗:', error);
      toast({
        title: "檢查訂單失敗",
        description: "系統錯誤，請稍後再試",
        variant: "destructive",
      });
    }
  };

  const updateDriverStatus = async (status: 'online' | 'offline') => {
    if (!profile?.userId) {
      console.error('❌ 無法取得用戶ID');
      toast({
        title: "登入錯誤",
        description: "無法獲取司機資訊",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('🔄 更新司機狀態:', { userId: profile.userId, status });

      // 直接嘗試更新，如果不存在則插入
      const { data: updateResult, error: updateError } = await supabase
        .from('driver_profiles')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('line_user_id', profile.userId)
        .select();

      if (updateError) {
        console.error('❌ 更新司機狀態錯誤:', updateError);
        
        // 如果更新失敗，嘗試插入新記錄
        console.log('👤 嘗試創建新司機資料');
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
            plate_number: 'ABC-1234',
            join_date: new Date().toISOString().split('T')[0]
          });

        if (insertError) {
          console.error('❌ 創建司機資料錯誤:', insertError);
          throw insertError;
        }
        
        console.log('✅ 司機資料創建成功');
      } else if (updateResult && updateResult.length === 0) {
        // 如果更新成功但沒有影響任何行，表示記錄不存在，需要插入
        console.log('👤 司機資料不存在，創建新記錄');
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
            plate_number: 'ABC-1234',
            join_date: new Date().toISOString().split('T')[0]
          });

        if (insertError) {
          console.error('❌ 創建司機資料錯誤:', insertError);
          throw insertError;
        }
        
        console.log('✅ 司機資料創建成功');
      } else {
        console.log('✅ 司機狀態更新成功');
      }

      // 如果司機上線，檢查並通知待接訂單
      if (status === 'online') {
        console.log('🔍 司機上線，開始檢查待接訂單...');
        // 稍等一下確保資料庫更新完成
        setTimeout(() => {
          checkForPendingOrders(profile.userId);
        }, 1000);
      }

      console.log('✅ 司機狀態更新成功:', status);
    } catch (error) {
      console.error('❌ 更新司機狀態失敗:', error);
      throw error;
    }
  };

  const handleOnlineToggle = async (checked: boolean) => {
    try {
      if (checked) {
        // 如果要上線，先嘗試獲取定位
        console.log('🔄 司機準備上線，先獲取定位...');
        await getCurrentLocation();
      }
      
      await updateDriverStatus(checked ? 'online' : 'offline');
      setIsOnline(checked);
      
      toast({
        title: checked ? "已上線" : "已下線",
        description: checked ? "開始接收訂單通知" : "停止接收訂單通知",
      });
    } catch (error) {
      console.error('❌ 切換狀態失敗:', error);
      toast({
        title: "狀態更新失敗",
        description: "請檢查網路連接後再試",
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
