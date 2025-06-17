
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const DriverOrders = () => {
  const { profile } = useLiff();
  const { toast } = useToast();
  const [orders, setOrders] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('call_records')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('載入訂單錯誤:', error);
        return;
      }

      const formattedOrders = (data || []).map(record => ({
        id: record.id,
        carType: record.car_type,
        carTypeLabel: record.car_type_label,
        status: record.status,
        timestamp: new Date(record.created_at),
        favoriteType: record.favorite_type,
        favoriteInfo: record.favorite_info || undefined,
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('載入訂單錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    if (!profile?.userId) return;

    try {
      const { error } = await supabase
        .from('call_records')
        .update({
          status: 'matched',
          driver_id: profile.userId,
          driver_name: profile.displayName || '司機',
          driver_phone: '0900-000-000',
          driver_plate_number: 'ABC-1234',
          driver_car_brand: 'Toyota',
          driver_car_color: '白色',
          accepted_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('接單錯誤:', error);
        toast({
          title: "接單失敗",
          description: "請稍後再試",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "接單成功",
        description: "已成功接受訂單",
      });

      loadOrders();
    } catch (error) {
      console.error('接單錯誤:', error);
    }
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
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-2">待接訂單</h2>
        <p className="text-blue-600">共 {orders.length} 筆待接訂單</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">目前沒有待接訂單</p>
            <p className="text-sm text-gray-400 mt-2">請稍候或重新整理頁面</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
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
                    onClick={() => acceptOrder(order.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <Car className="h-4 w-4 mr-2" />
                    接受訂單
                  </Button>
                  <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default DriverOrders;
