import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { CallRecord, FavoriteCode, FavoriteAddress } from "@/types/callCar";
import { CAR_TYPES, MAX_CALL_RECORDS } from "@/constants/callCar";
import { loadFavorites, loadCallRecords, createCallRecord, updateCallRecord } from "@/utils/callCarApi";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/profile";
import CallForm from "./callCar/CallForm";
import CallRecords from "./callCar/CallRecords";

const CallCar = () => {
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (liffProfile?.userId) {
      loadUserData();
    }
  }, [liffProfile]);

  const loadUserData = async () => {
    if (!liffProfile?.userId) return;

    // Load favorites and call records
    const { codes, addresses } = await loadFavorites(liffProfile.userId);
    setFavoriteCodes(codes);
    setFavoriteAddresses(addresses);

    const records = await loadCallRecords(liffProfile.userId);
    setCallRecords(records);

    // Load user profile from database
    await loadUserProfile();
  };

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
        // 如果沒有個人資料，使用 LIFF 預設資料
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
        // 如果沒有個人資料，使用 LIFF 預設資料
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
      const newCallRecord = await createCallRecord(
        liffProfile.userId,
        carType,
        selectedCarType?.label || "不限",
        favoriteType,
        favoriteInfo
      );

      setCallRecords(prev => [newCallRecord, ...prev.slice(0, MAX_CALL_RECORDS - 1)]);
      
      // Simulate call car process
      setTimeout(async () => {
        const success = Math.random() > 0.3; // 70% success rate
        
        const driverInfo = success ? {
          name: "王師傅",
          phone: "0987-654-321",
          plateNumber: "ABC-1234",
          carBrand: "Toyota",
          carColor: "白色"
        } : undefined;
        
        try {
          await updateCallRecord(
            newCallRecord.id,
            success ? 'matched' : 'failed',
            driverInfo
          );

          setCallRecords(prev => 
            prev.map(record => 
              record.id === newCallRecord.id 
                ? { ...record, status: success ? 'matched' : 'failed', driverInfo }
                : record
            )
          );

          if (success) {
            toast({
              title: "叫車成功！",
              description: `已媒合${selectedCarType?.label}司機，預計5分鐘後到達`,
            });
          } else {
            toast({
              title: "叫車失敗",
              description: "未能找到合適的司機，請稍後再試",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('更新叫車記錄錯誤:', error);
        }
        
        setIsLoading(false);
      }, 3000);
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

  return (
    <div className="space-y-4">
      <CallForm
        carType={carType}
        setCarType={setCarType}
        favoriteType={favoriteType}
        setFavoriteType={setFavoriteType}
        selectedCode={selectedCode}
        setSelectedCode={setSelectedCode}
        selectedAddressName={selectedAddressName}
        setSelectedAddressName={setSelectedAddressName}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        favoriteCodes={favoriteCodes}
        favoriteAddresses={favoriteAddresses}
        isLoading={isLoading}
        callRecordsCount={callRecords.length}
        onCallCar={handleCallCar}
      />

      {userProfile && (
        <CallRecords
          callRecords={callRecords}
          userProfile={userProfile}
          onCancelCall={handleCancelCall}
        />
      )}
    </div>
  );
};

export default CallCar;
