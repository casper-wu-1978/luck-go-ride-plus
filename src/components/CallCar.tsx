
import { useEffect } from "react";
import { useCallCar } from "@/hooks/useCallCar";
import { useCallCarProfile } from "@/hooks/useCallCarProfile";
import { useCallRecordsRealtime } from "@/hooks/useCallRecordsRealtime";
import { useLiff } from "@/contexts/LiffContext";
import OnlineDriversStatus from "./callCar/OnlineDriversStatus";
import CallForm from "./callCar/CallForm";
import CallRecords from "./callCar/CallRecords";

const CallCar = () => {
  const { profile } = useLiff();
  const {
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
    setCarType,
    setFavoriteType,
    setSelectedCode,
    setSelectedAddressName,
    setSelectedAddress,
    handleCallCar,
    handleCancelCall,
    loadOnlineDriversCount,
    loadUserData,
    updateRecordFromRealtime,
  } = useCallCar();

  const { userProfile } = useCallCarProfile();

  // 設置實時監聽
  useCallRecordsRealtime({
    lineUserId: profile?.userId,
    onRecordUpdate: updateRecordFromRealtime,
  });

  useEffect(() => {
    console.log('CallCar 組件載入，開始載入數據');
    loadUserData();
    loadOnlineDriversCount();
  }, []);

  // 添加調試日誌
  useEffect(() => {
    console.log('CallCar - 叫車記錄更新:', callRecords.length, callRecords);
  }, [callRecords]);

  return (
    <div className="space-y-4">
      <OnlineDriversStatus
        onlineDriversCount={onlineDriversCount}
        onRefresh={loadOnlineDriversCount}
      />

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
