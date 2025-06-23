
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Phone, MapPin, Clock, Building2, User } from "lucide-react";

interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: string;
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
  merchantInfo?: {
    businessName: string;
    contactName: string;
    phone: string;
    businessAddress: string;
  };
}

interface OrderCardProps {
  order: CallRecord;
  isOnline: boolean;
  onAcceptOrder: (orderId: string) => void;
}

const OrderCard = ({ order, isOnline, onAcceptOrder }: OrderCardProps) => {
  const getLocationDisplay = () => {
    if (order.favoriteType === 'code') {
      return `代碼: ${order.favoriteInfo}`;
    } else if (order.favoriteType === 'address') {
      return `地址: ${order.favoriteInfo}`;
    } else if (order.favoriteType === 'current' && order.merchantInfo) {
      return `商家地址: ${order.merchantInfo.businessAddress}`;
    }
    return '現在位置';
  };

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
          
          {/* 商家資訊 */}
          {order.merchantInfo && (
            <div className="bg-blue-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center text-sm font-medium text-blue-800">
                <Building2 className="h-4 w-4 mr-2" />
                {order.merchantInfo.businessName}
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <User className="h-4 w-4 mr-2" />
                聯絡人：{order.merchantInfo.contactName}
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <Phone className="h-4 w-4 mr-2" />
                {order.merchantInfo.phone}
              </div>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {getLocationDisplay()}
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
            {order.merchantInfo?.phone && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(`tel:${order.merchantInfo?.phone}`, '_self')}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
