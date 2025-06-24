
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { CAR_TYPES, MAX_CALL_RECORDS } from "@/constants/callCar";
import { useCallRecords } from "./useCallRecords";
import { useFavorites } from "./useFavorites";
import { useOnlineDrivers } from "./useOnlineDrivers";
import { useCallCarForm } from "./useCallCarForm";
import { supabase } from "@/integrations/supabase/client";

export const useCallCar = () => {
  const { profile: liffProfile } = useLiff();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Use the focused hooks
  const {
    callRecords,
    loadRecords,
    createRecord,
    cancelRecord,
    updateRecordFromRealtime,
  } = useCallRecords(liffProfile?.userId);

  const {
    favoriteCodes,
    favoriteAddresses,
    loadUserFavorites,
  } = useFavorites();

  const {
    onlineDriversCount,
    loadOnlineDriversCount,
  } = useOnlineDrivers();

  const {
    carType,
    favoriteType,
    selectedCode,
    selectedAddressName,
    selectedAddress,
    setCarType,
    setFavoriteType,
    setSelectedCode,
    setSelectedAddressName,
    setSelectedAddress,
  } = useCallCarForm();

  const loadUserData = async () => {
    if (!liffProfile?.userId) return;
    await loadUserFavorites(liffProfile.userId);
    await loadRecords();
  };

  const handleCallCar = async () => {
    if (!liffProfile?.userId) {
      toast({
        title: "請先登入",
        description: "需要登入才能叫車",
        variant: "destructive"
      });
      return;
    }

    if (favoriteType === "code" && !selectedCode) {
      toast({
        title: "請選擇代碼",
        description: "請選擇一個代碼",
        variant: "destructive"
      });
      return;
    }

    if (favoriteType === "address" && (!selectedAddressName || !selectedAddress)) {
      toast({
        title: "請選擇地址",
        description: "請選擇一個地址",
        variant: "destructive"
      });
      return;
    }

    if (callRecords.length >= MAX_CALL_RECORDS) {
      toast({
        title: "叫車次數已達上限",
        description: `最多只能叫${MAX_CALL_RECORDS}次車`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const selectedCarType = CAR_TYPES.find(type => type.id === carType);
    
    let favoriteInfo = "";
    if (favoriteType === "code" && selectedCode) {
      favoriteInfo = selectedCode;
    } else if (favoriteType === "address" && selectedAddressName) {
      favoriteInfo = `${selectedAddressName}: ${selectedAddress}`;
    }
    
    try {
      await createRecord(
        carType,
        selectedCarType?.label || "不限",
        favoriteType,
        favoriteInfo
      );
      
      toast({
        title: "叫車請求已送出",
        description: "您的叫車請求已成功送出，我們會盡快為您安排司機",
      });

      setIsLoading(false);
    } catch (error) {
      console.error('叫車錯誤:', error);
      toast({
        title: "叫車失敗",
        description: "發生未知錯誤",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleCancelCall = async (recordId: string) => {
    console.log('開始取消叫車:', recordId);
    
    // 先獲取訂單狀態和司機資訊
    const { data: orderData, error } = await supabase
      .from('call_records')
      .select('status, driver_id, driver_name, line_user_id')
      .eq('id', recordId)
      .single();

    if (error) {
      console.error('獲取訂單資訊錯誤:', error);
      toast({
        title: "取消失敗",
        description: "無法獲取訂單資訊",
        variant: "destructive"
      });
      return;
    }

    if (!orderData) {
      toast({
        title: "取消失敗",
        description: "找不到訂單資訊",
        variant: "destructive"
      });
      return;
    }

    try {
      if (orderData.status === 'waiting') {
        // 未媒合司機 - 直接取消
        console.log('未媒合司機，直接取消訂單');
        await cancelRecord(recordId);
        
        toast({
          title: "已取消叫車",
          description: "您的叫車請求已成功取消",
        });
      } else if (orderData.status === 'matched' && orderData.driver_id) {
        // 已媒合司機 - 需要通知司機並扣除回饋金
        console.log('已媒合司機，需要通知司機並扣除回饋金');
        
        // 發送 LINE 通知給司機
        if (orderData.driver_id) {
          try {
            await supabase.functions.invoke('send-line-notification', {
              body: {
                userId: orderData.driver_id,
                message: `您接受的訂單已被商家取消。\n由於訂單已媒合，將扣除100元回饋金作為平台費用。\n此費用將於下次繳納平台費時扣除。`
              }
            });
            console.log('已發送取消通知給司機');
          } catch (notificationError) {
            console.error('發送司機通知錯誤:', notificationError);
            // 即使通知失敗也繼續取消流程
          }
        }

        // 取消訂單
        await cancelRecord(recordId);

        // 記錄平台費用扣除（這裡可以添加到獎勵系統或單獨的費用記錄表）
        // 暫時使用 console.log 記錄，實際應該寫入資料庫
        console.log(`司機 ${orderData.driver_id} 因訂單取消被扣除100元平台費用`);

        toast({
          title: "已取消叫車",
          description: "已通知司機並扣除其100元回饋金作為平台費用",
        });
      } else {
        toast({
          title: "無法取消",
          description: "此訂單狀態無法取消",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('取消叫車錯誤:', error);
      toast({
        title: "取消失敗",
        description: "發生未知錯誤",
        variant: "destructive"
      });
    }
  };

  return {
    // State
    isLoading,
    carType,
    favoriteType,
    selectedCode,
    selectedAddressName,
    selectedAddress,
    callRecords,
    favoriteCodes,
    favoriteAddresses,
    onlineDriversCount,
    
    // Setters
    setCarType,
    setFavoriteType,
    setSelectedCode,
    setSelectedAddressName,
    setSelectedAddress,
    
    // Actions
    handleCallCar,
    handleCancelCall,
    loadOnlineDriversCount,
    loadUserData,
    updateRecordFromRealtime,
  };
};
