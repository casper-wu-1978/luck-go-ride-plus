
import { useDriverOrders } from "@/hooks/useDriverOrders";
import { useDriverStatus } from "@/hooks/useDriverStatus";
import { useDriverOrdersRealtime } from "@/hooks/useDriverOrdersRealtime";
import { Car } from "lucide-react";
import DriverStatusCard from "./DriverStatusCard";
import OrdersList from "./OrdersList";
import AcceptedOrderCard from "./AcceptedOrderCard";

const DriverOrders = () => {
  const { 
    orders, 
    acceptedOrders, 
    isLoading, 
    loadOrders, 
    acceptOrder,
    handleNavigate,
    handleCancelOrder,
    handleCompleteOrder,
    handleArriveOrder
  } = useDriverOrders();
  
  const { 
    isOnline, 
    currentLocation, 
    isGettingLocation, 
    getCurrentLocation, 
    handleOnlineToggle 
  } = useDriverStatus();

  // 添加實時監聽
  const { isConnected } = useDriverOrdersRealtime({
    onOrderUpdate: loadOrders
  });

  const handleAcceptOrder = (orderId: string) => {
    acceptOrder(orderId, isOnline);
  };

  const handleCompleteWithData = (orderId: string, completionData?: {
    destinationAddress: string;
    distanceKm: number;
    fareAmount: number;
  }) => {
    handleCompleteOrder(orderId, completionData);
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
      {/* 實時連接狀態指示器 */}
      <div className="text-xs text-gray-500 text-center">
        實時連接狀態: {isConnected ? '✅ 已連接' : '❌ 未連接'}
      </div>

      <DriverStatusCard
        isOnline={isOnline}
        currentLocation={currentLocation}
        isGettingLocation={isGettingLocation}
        onToggleOnline={handleOnlineToggle}
        onGetCurrentLocation={getCurrentLocation}
      />

      {/* 已接訂單區域 */}
      {acceptedOrders.length > 0 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-blue-800 mb-2">進行中的訂單</h2>
            <p className="text-blue-600">共 {acceptedOrders.length} 筆進行中訂單</p>
          </div>
          
          <div className="space-y-3">
            {acceptedOrders.map((order) => (
              <AcceptedOrderCard
                key={order.id}
                order={order}
                onNavigate={handleNavigate}
                onCancel={handleCancelOrder}
                onComplete={handleCompleteWithData}
                onArrive={handleArriveOrder}
              />
            ))}
          </div>
        </div>
      )}

      {/* 待接訂單區域 */}
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
