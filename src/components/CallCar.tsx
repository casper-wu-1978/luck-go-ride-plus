
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

  // 設置實時監聽 - 使用穩定的 updateRecordFromRealtime 函數
  const { isConnected } = useCallRecordsRealtime({
    lineUserId: profile?.userId,
    onRecordUpdate: updateRecordFromRealtime,
  });

  useEffect(() => {
    console.log('CallCar 組件載入，開始載入數據');
    if (profile?.userId) {
      loadUserData();
      loadOnlineDriversCount();
    }
  }, [profile?.userId, loadUserData, loadOnlineDriversCount]);

  // 調試日誌
  useEffect(() => {
    console.log('CallCar - 叫車記錄更新:', callRecords.length, callRecords);
    console.log('CallCar - 實時連接狀態:', isConnected);
  }, [callRecords, isConnected]);

  // 如果沒有 profile，顯示載入中
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 實時連接狀態指示器 */}
      <div className="text-xs text-gray-500 text-center">
        實時連接狀態: {isConnected ? '✅ 已連接' : '❌ 未連接'}
      </div>

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
