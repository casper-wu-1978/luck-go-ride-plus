
import { useEffect } from "react";
import { useCallCar } from "@/hooks/useCallCar";
import { useCallCarProfile } from "@/hooks/useCallCarProfile";
import OnlineDriversStatus from "./callCar/OnlineDriversStatus";
import CallForm from "./callCar/CallForm";
import CallRecords from "./callCar/CallRecords";

const CallCar = () => {
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
  } = useCallCar();

  const { userProfile } = useCallCarProfile();

  useEffect(() => {
    loadUserData();
    loadOnlineDriversCount();
  }, []);

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
