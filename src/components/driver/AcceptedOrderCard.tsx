
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Phone, MapPin, Clock, XCircle, CheckCircle, Car } from "lucide-react";

interface AcceptedOrder {
  id: string;
  carTypeLabel: string;
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
  status: string;
}

interface AcceptedOrderCardProps {
  order: AcceptedOrder;
  onNavigate: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onArrive?: (orderId: string) => void; // New prop for arrive action
}

const AcceptedOrderCard = ({ order, onNavigate, onCancel, onComplete, onArrive }: AcceptedOrderCardProps) => {
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

  return (
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
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {order.favoriteType === 'code' ? `代碼: ${order.favoriteInfo}` : 
             order.favoriteType === 'address' ? `地址: ${order.favoriteInfo}` : '現在位置'}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3">
            <Button 
              onClick={() => onNavigate(order.id)}
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
                onClick={() => onComplete(order.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                開始行程
              </Button>
            )}
            
            {order.status === 'in_progress' && (
              <Button 
                onClick={() => onComplete(order.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                完成訂單
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
  );
};

export default AcceptedOrderCard;
