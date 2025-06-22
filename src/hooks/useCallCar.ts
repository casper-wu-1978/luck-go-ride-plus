
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { CallRecord, FavoriteCode, FavoriteAddress } from "@/types/callCar";
import { CAR_TYPES, MAX_CALL_RECORDS } from "@/constants/callCar";
import { loadFavorites, loadCallRecords, createCallRecord, updateCallRecord } from "@/utils/callCarApi";
import { getOnlineDrivers } from "@/utils/driverMatching";
import { UserProfile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";

export const useCallCar = () => {
  const { profile: liffProfile } = useLiff();
  const [isLoading, setIsLoading] = useState(false);
  const [carType, setCarType] = useState("unlimited");
  const [favoriteType, setFavoriteType] = useState("none");
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedAddressName, setSelectedAddressName] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [favoriteCodes, setFavoriteCodes] = useState<FavoriteCode[]>([]);
  const [favoriteAddresses, setFavoriteAddresses] = useState<FavoriteAddress[]>([]);
  const [onlineDriversCount, setOnlineDriversCount] = useState(0);
  const { toast } = useToast();

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
          // 重新載入線上司機數量
          loadOnlineDriversCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUserData = async () => {
    if (!liffProfile?.userId) return;

    const { codes, addresses } = await loadFavorites(liffProfile.userId);
    setFavoriteCodes(codes);
    setFavoriteAddresses(addresses);

    const records = await loadCallRecords(liffProfile.userId);
    setCallRecords(records);
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
      const newCallRecord = await createCallRecord(
        liffProfile.userId,
        carType,
        selectedCarType?.label || "不限",
        favoriteType,
        favoriteInfo
      );

      setCallRecords(prev => [newCallRecord, ...prev.slice(0, MAX_CALL_RECORDS - 1)]);
      
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
      await updateCallRecord(recordId, 'cancelled');

      setCallRecords(prev => 
        prev.map(record => 
          record.id === recordId 
            ? { ...record, status: 'cancelled' }
            : record
        )
      );

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
