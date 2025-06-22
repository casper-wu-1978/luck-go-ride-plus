
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { CAR_TYPES, MAX_CALL_RECORDS } from "@/constants/callCar";
import { useCallRecords } from "./useCallRecords";
import { useFavorites } from "./useFavorites";
import { useOnlineDrivers } from "./useOnlineDrivers";
import { useCallRecordsRealtime } from "./useCallRecordsRealtime";
import { useCallCarForm } from "./useCallCarForm";

export const useCallCar = () => {
  const { profile: liffProfile } = useLiff();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Use the new focused hooks
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

  // Set up real-time listener for call records
  useCallRecordsRealtime({
    lineUserId: liffProfile?.userId,
    onRecordUpdate: updateRecordFromRealtime,
  });

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

    if (onlineDriversCount === 0) {
      toast({
        title: "目前無可用司機",
        description: "請稍後再試，或聯繫客服協助",
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
        description: "等待司機接單中，請稍候...",
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
    try {
      await cancelRecord(recordId);
      toast({
        title: "已取消叫車",
        description: "您的叫車請求已成功取消",
      });
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
  };
};
