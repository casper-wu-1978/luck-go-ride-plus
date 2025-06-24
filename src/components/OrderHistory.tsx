
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Car, Clock, MapPin } from "lucide-react";
import { useLiff } from "@/contexts/LiffContext";
import { merchantOrderService } from "@/services/merchantOrderService";
import MerchantAcceptedOrderCard from "@/components/merchant/MerchantAcceptedOrderCard";
import type { CallRecord } from "@/types/driverOrders";

const OrderHistory = () => {
  const [orders, setOrders] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useLiff();

  useEffect(() => {
    const loadOrders = async () => {
      if (!profile?.userId) return;
      
      try {
        setIsLoading(true);
        const merchantOrders = await merchantOrderService.loadMerchantOrders(profile.userId);
        setOrders(merchantOrders);
      } catch (error) {
        console.error('載入訂單紀錄錯誤:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [profile?.userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Car className="h-12 w-12 text-green-600 mx-auto mb-4 animate-bounce" />
          <p className="text-green-800">載入訂單紀錄中...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">尚無訂單紀錄</h3>
        <p className="text-gray-500">您還沒有叫車紀錄</p>
      </div>
    );
  }

  // 分類訂單
  const activeOrders = orders.filter(order => 
    ['matched', 'arrived', 'in_progress'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">叫車紀錄</h2>
        <p className="text-green-600">共 {orders.length} 筆紀錄</p>
      </div>

      {/* 進行中的訂單 */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-800">進行中的訂單</h3>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <MerchantAcceptedOrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* 已完成的訂單 */}
      {completedOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">歷史紀錄</h3>
          <div className="space-y-3">
            {completedOrders.map((order) => (
              <MerchantAcceptedOrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
