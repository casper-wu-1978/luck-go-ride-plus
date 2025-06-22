
import { useDriverOrders } from "@/hooks/useDriverOrders";
import { useDriverStatus } from "@/hooks/useDriverStatus";
import { Car } from "lucide-react";
import DriverStatusCard from "./DriverStatusCard";
import OrdersList from "./OrdersList";

const DriverOrders = () => {
  const { orders, isLoading, loadOrders, acceptOrder } = useDriverOrders();
  const { 
    isOnline, 
    currentLocation, 
    isGettingLocation, 
    getCurrentLocation, 
    handleOnlineToggle 
  } = useDriverStatus();

  const handleAcceptOrder = (orderId: string) => {
    acceptOrder(orderId, isOnline);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Car className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-bounce" />
          <p className="text-blue-800">載入訂單中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DriverStatusCard
        isOnline={isOnline}
        currentLocation={currentLocation}
        isGettingLocation={isGettingLocation}
        onToggleOnline={handleOnlineToggle}
        onGetCurrentLocation={getCurrentLocation}
      />

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-2">待接訂單</h2>
        <p className="text-blue-600">共 {orders.length} 筆待接訂單</p>
      </div>

      <OrdersList
        orders={orders}
        isOnline={isOnline}
        onAcceptOrder={handleAcceptOrder}
      />
    </div>
  );
};

export default DriverOrders;
