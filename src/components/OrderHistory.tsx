
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLiff } from "@/contexts/LiffContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Car, Loader2 } from "lucide-react";

const OrderHistory = () => {
  const { profile } = useLiff();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['merchant-history', profile?.userId],
    queryFn: async () => {
      if (!profile?.userId) return [];
      
      const { data, error } = await supabase
        .from('call_records')
        .select('*')
        .eq('line_user_id', profile.userId)
        .in('status', ['completed', 'cancelled']) // 只顯示已完成或已取消的訂單
        .order('created_at', { ascending: false });

      if (error) {
        console.error('載入歷史訂單錯誤:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.userId,
    refetchInterval: 30000, // 每30秒刷新一次即可，歷史記錄不需要太頻繁
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-green-800">載入紀錄中...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">目前沒有歷史紀錄</h3>
          <p className="text-gray-500">完成或取消的訂單會在此顯示</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">歷史紀錄</h2>
        <p className="text-green-600">共 {orders.length} 筆歷史紀錄</p>
      </div>

      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-green-800">
                {order.car_type_label}
              </CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {new Date(order.created_at).toLocaleString('zh-TW')}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {order.favorite_type === 'code' ? `代碼: ${order.favorite_info}` : 
                 order.favorite_type === 'address' ? `地址: ${order.favorite_info}` : '現在位置'}
              </div>

              {/* 顯示車資（如果有的話） */}
              {order.fare_amount && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 font-medium">車資: NT$ {order.fare_amount}</p>
                </div>
              )}

              {/* 顯示司機資訊（如果有的話） */}
              {order.driver_name && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">司機資訊</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">姓名:</span> {order.driver_name}</p>
                    {order.driver_phone && (
                      <p><span className="font-medium">電話:</span> {order.driver_phone}</p>
                    )}
                    {order.driver_plate_number && (
                      <p><span className="font-medium">車牌:</span> {order.driver_plate_number}</p>
                    )}
                    {order.driver_car_brand && order.driver_car_color && (
                      <p><span className="font-medium">車輛:</span> {order.driver_car_color} {order.driver_car_brand}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderHistory;
