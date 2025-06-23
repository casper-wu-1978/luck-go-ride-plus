
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Phone, MapPin, Clock, XCircle, CheckCircle, Car, Building2, User } from "lucide-react";
import OrderCompletionForm from "./OrderCompletionForm";

interface AcceptedOrder {
  id: string;
  carTypeLabel: string;
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
  status: string;
  merchantInfo?: {
    businessName: string;
    contactName: string;
    phone: string;
    businessAddress: string;
  };
}

interface AcceptedOrderCardProps {
  order: AcceptedOrder;
  onNavigate: (orderId: string) => void;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'matched': return '已接單';
      case 'arrived': return '已抵達';
      case 'in_progress': return '行程中';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'bg-blue-600';
      case 'arrived': return 'bg-green-600';
      case 'in_progress': return 'bg-purple-600';
      default: return 'bg-blue-600';
    }
  };

  const getLocationDisplay = () => {
    if (order.favoriteType === 'code') {
      return `代碼: ${order.favoriteInfo}`;
    } else if (order.favoriteType === 'address') {
      return `地址: ${order.favoriteInfo}`;
    } else if (order.favoriteType === 'current' && order.merchantInfo) {
      // 顯示商家地址而不是「現在位置」
      return `商家地址: ${order.merchantInfo.businessAddress}`;
    }
    return '位置資訊不明';
  };

  const handleNavigateClick = () => {
    // 直接處理導航邏輯而不是依賴外部函數
    let navigationUrl = '';
    
    if (order.favoriteType === 'current' && order.merchantInfo?.businessAddress) {
      // 如果是現在位置，導航到商家地址
      navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.merchantInfo.businessAddress)}`;
    } else if (order.favoriteType === 'code' && order.favoriteInfo) {
      // 如果是代碼，搜索該代碼
      navigationUrl = `https://www.google.com/maps/search/${encodeURIComponent(order.favoriteInfo)}`;
    } else if (order.favoriteType === 'address' && order.favoriteInfo) {
      // 如果是地址，直接導航到該地址
      navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.favoriteInfo)}`;
    }

    if (navigationUrl) {
      // 開啟Google地圖
      window.open(navigationUrl, '_blank');
    } else {
      // 如果沒有可用的位置資訊，則使用原有的函數
      onNavigate(order.id);
    }
  };

  const handleCompleteClick = () => {
    if (order.status === 'in_progress') {
      // Show completion form for final completion
      setShowCompletionForm(true);
    } else {
      // Direct completion for status transitions (arrived -> in_progress)
      onComplete(order.id);
    }
  };

  const handleCompletionSubmit = (completionData: {
    orderId: string;
    destinationAddress: string;
    distanceKm: number;
    fareAmount: number;
  }) => {
    onComplete(completionData.orderId, {
      destinationAddress: completionData.destinationAddress,
      distanceKm: completionData.distanceKm,
      fareAmount: completionData.fareAmount
    });
  };

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg text-blue-800">{order.carTypeLabel}</CardTitle>
            <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
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
              <div className="bg-white p-3 rounded-lg space-y-2 border border-blue-200">
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

            <div className="grid grid-cols-2 gap-2 pt-3">
              <Button 
                onClick={handleNavigateClick}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Navigation className="h-4 w-4 mr-2" />
                導航
              </Button>
              
              {/* Dynamic button based on status */}
              {order.status === 'matched' && onArrive && (
                <Button 
                  onClick={() => onArrive(order.id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Car className="h-4 w-4 mr-2" />
                  抵達
                </Button>
              )}
              
              {order.status === 'arrived' && (
                <Button 
                  onClick={handleCompleteClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  開始行程
                </Button>
              )}
              
              {order.status === 'in_progress' && (
                <Button 
                  onClick={handleCompleteClick}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  完成訂單
                </Button>
              )}
              
              {/* 聯絡商家按鈕 */}
              {order.merchantInfo?.phone && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`tel:${order.merchantInfo?.phone}`, '_self')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  聯絡商家
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => onCancel(order.id)}
                className="col-span-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                取消訂單
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderCompletionForm
        orderId={order.id}
        isOpen={showCompletionForm}
        onClose={() => setShowCompletionForm(false)}
        onSubmit={handleCompletionSubmit}
      />
    </>
  );
};

export default AcceptedOrderCard;
