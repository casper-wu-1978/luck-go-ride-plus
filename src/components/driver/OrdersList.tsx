
import { Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import OrderCard from "./OrderCard";

interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: string;
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
}

interface OrdersListProps {
  orders: CallRecord[];
  isOnline: boolean;
  onAcceptOrder: (orderId: string) => void;
}

const OrdersList = ({ orders, isOnline, onAcceptOrder }: OrdersListProps) => {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">目前沒有待接訂單</p>
          <p className="text-sm text-gray-400 mt-2">請稍候或重新整理頁面</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          isOnline={isOnline}
          onAcceptOrder={onAcceptOrder}
        />
      ))}
    </div>
  );
};

export default OrdersList;
