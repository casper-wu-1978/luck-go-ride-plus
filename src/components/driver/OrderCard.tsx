
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Phone, MapPin, Clock } from "lucide-react";

interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: string;
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
}

interface OrderCardProps {
  order: CallRecord;
  isOnline: boolean;
  onAcceptOrder: (orderId: string) => void;
}

const OrderCard = ({ order, isOnline, onAcceptOrder }: OrderCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{order.carTypeLabel}</CardTitle>
          <Badge variant="secondary">待接單</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {order.timestamp.toLocaleString('zh-TW')}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {order.favoriteType === 'code' ? `代碼: ${order.favoriteInfo}` : 
             order.favoriteType === 'address' ? `地址: ${order.favoriteInfo}` : '現在位置'}
          </div>

          <div className="flex gap-2 pt-3">
            <Button 
              onClick={() => onAcceptOrder(order.id)}
              disabled={!isOnline}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1 disabled:opacity-50"
            >
              <Car className="h-4 w-4 mr-2" />
              {!isOnline ? '請先上線' : '接受訂單'}
            </Button>
            <Button variant="outline" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
