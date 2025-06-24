
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Phone, MapPin, Clock, Building2, User } from "lucide-react";
import type { CallRecord } from "@/types/driverOrders";

interface MerchantAcceptedOrderCardProps {
  order: CallRecord;
}

const MerchantAcceptedOrderCard = ({ order }: MerchantAcceptedOrderCardProps) => {
  const getStatusBadge = () => {
    switch (order.status) {
      case 'matched':
        return <Badge className="bg-blue-500">司機已接單</Badge>;
      case 'arrived':
        return <Badge className="bg-green-500">司機已抵達</Badge>;
      case 'in_progress':
        return <Badge className="bg-orange-500">行程進行中</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500">已完成</Badge>;
      default:
        return <Badge variant="secondary">{order.status}</Badge>;
    }
  };

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
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {order.timestamp.toLocaleString('zh-TW')}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {getLocationDisplay()}
          </div>

          {/* 司機資訊 */}
          {order.driverInfo && (
            <div className="bg-green-50 p-3 rounded-lg space-y-2">
              <div className="text-sm font-medium text-green-800 mb-2">司機資訊</div>
              <div className="flex items-center text-sm text-green-700">
                <User className="h-4 w-4 mr-2" />
                姓名：{order.driverInfo.name}
              </div>
              {order.driverInfo.phone && (
                <div className="flex items-center text-sm text-green-700">
                  <Phone className="h-4 w-4 mr-2" />
                  電話：{order.driverInfo.phone}
                </div>
              )}
              {order.driverInfo.plateNumber && (
                <div className="flex items-center text-sm text-green-700">
                  <Car className="h-4 w-4 mr-2" />
                  車牌：{order.driverInfo.plateNumber}
                </div>
              )}
              {order.driverInfo.carBrand && (
                <div className="flex items-center text-sm text-green-700">
                  <Car className="h-4 w-4 mr-2" />
                  品牌：{order.driverInfo.carBrand}
                </div>
              )}
              {order.driverInfo.carColor && (
                <div className="flex items-center text-sm text-green-700">
                  <Car className="h-4 w-4 mr-2" />
                  顏色：{order.driverInfo.carColor}
                </div>
              )}
            </div>
          )}

          {order.status === 'matched' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                司機正在前往您的位置，請耐心等候
              </p>
            </div>
          )}

          {order.status === 'arrived' && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                司機已抵達，請準備上車
              </p>
            </div>
          )}

          {order.status === 'in_progress' && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-800">
                行程進行中，請安全抵達目的地
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MerchantAcceptedOrderCard;
