import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Phone, MapPin, Clock, Building2, User, Navigation } from "lucide-react";
import OrderCompletionForm from "./OrderCompletionForm";

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
  driverInfo?: {
    name: string;
    phone: string;
    plateNumber: string;
    carBrand: string;
    carColor: string;
  };
}

interface AcceptedOrderCardProps {
  order: CallRecord;
  onNavigate?: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onComplete: (orderId: string, completionData?: {
    destinationAddress: string;
    distanceKm: number;
    fareAmount: number;
  }) => void;
  onArrive?: (orderId: string) => void;
}

const AcceptedOrderCard = ({ order, onNavigate, onCancel, onComplete, onArrive }: AcceptedOrderCardProps) => {
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  const getStatusBadge = () => {
    switch (order.status) {
      case 'matched':
        return <Badge className="bg-blue-500">已接單 - 前往中</Badge>;
      case 'arrived':
        return <Badge className="bg-green-500">已抵達</Badge>;
      case 'in_progress':
        return <Badge className="bg-orange-500">行程進行中</Badge>;
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

  const handleNavigate = () => {
    if (!order.merchantInfo?.businessAddress) return;
    
    const encodedAddress = encodeURIComponent(order.merchantInfo.businessAddress);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleCompleteOrder = (completionData?: {
    destinationAddress: string;
    distanceKm: number;
    fareAmount: number;
  }) => {
    onComplete(order.id, completionData);
    setShowCompletionForm(false);
  };

  const getActionButtons = () => {
    switch (order.status) {
      case 'matched':
        return (
          <div className="flex gap-2 pt-3">
            <Button 
              onClick={handleNavigate}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              <Navigation className="h-4 w-4 mr-2" />
              導航
            </Button>
            <Button 
              onClick={() => onArrive && onArrive(order.id)}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              已抵達
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onCancel(order.id)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              取消
            </Button>
          </div>
        );
      case 'arrived':
        return (
          <div className="flex gap-2 pt-3">
            <Button 
              onClick={handleNavigate}
              variant="outline"
              className="flex-1"
            >
              <Navigation className="h-4 w-4 mr-2" />
              導航
            </Button>
            <Button 
              onClick={() => onComplete(order.id)}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              開始行程
            </Button>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex gap-2 pt-3">
            <Button 
              onClick={() => setShowCompletionForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              完成行程
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (order.status) {
      case 'matched':
        return (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              請前往接客地點，抵達後點擊「已抵達」按鈕
            </p>
          </div>
        );
      case 'arrived':
        return (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              已抵達接客地點，等待乘客上車後點擊「開始行程」
            </p>
          </div>
        );
      case 'in_progress':
        return (
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-800">
              行程進行中，抵達目的地後點擊「完成行程」
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
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

            {getStatusMessage()}
            {getActionButtons()}
          </div>
        </CardContent>
      </Card>

      <OrderCompletionForm
        orderId={order.id}
        isOpen={showCompletionForm}
        onClose={() => setShowCompletionForm(false)}
        onSubmit={handleCompleteOrder}
      />
    </>
  );
};

export default AcceptedOrderCard;
