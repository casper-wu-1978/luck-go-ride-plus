
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Car, Phone, MapPin, Clock, Navigation } from "lucide-react";

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
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");

  useEffect(() => {
    loadOrders();
    loadMapboxToken();
    checkDriverStatus();
  }, []);

  // 實時監聽新訂單
  useEffect(() => {
    if (!isOnline) return;

    const channel = supabase
      .channel('call_records_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_records',
          filter: 'status=eq.waiting'
        },
        (payload) => {
          console.log('新的叫車訂單:', payload);
          loadOrders(); // 重新載入訂單
          toast({
            title: "新的叫車請求",
            description: "有新的乘客需要叫車服務",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  const checkDriverStatus = async () => {
    if (!profile?.userId) return;

    try {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('status')
        .eq('line_user_id', profile.userId)
        .single();

      if (data && data.status === 'online') {
        setIsOnline(true);
      }
    } catch (error) {
      console.error('檢查司機狀態錯誤:', error);
    }
  };

  const loadMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) {
        console.error('無法獲取 Mapbox token:', error);
        return;
      }
      setMapboxToken(data.token);
    } catch (error) {
      console.error('載入 Mapbox token 錯誤:', error);
    }
  };

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

  const getCurrentLocation = async () => {
    if (!mapboxToken) {
      toast({
        title: "定位失敗",
        description: "Mapbox 服務尚未初始化",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // 使用 Mapbox 反向地理編碼獲取地址
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&language=zh-TW`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setCurrentLocation(data.features[0].place_name);
        } else {
          setCurrentLocation(`緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`);
        }
      } else {
        setCurrentLocation(`緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`);
      }

      toast({
        title: "定位成功",
        description: "已獲取您的當前位置",
      });
    } catch (error) {
      console.error('定位錯誤:', error);
      setCurrentLocation("無法獲取位置");
      toast({
        title: "定位失敗",
        description: "請檢查定位權限設定",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const updateDriverStatus = async (status: 'online' | 'offline') => {
    if (!profile?.userId) return;

    try {
      // 先檢查是否已有司機資料
      const { data: existingDriver } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('line_user_id', profile.userId)
        .single();

      if (!existingDriver) {
        // 如果沒有司機資料，先創建一個
        await supabase
          .from('driver_profiles')
          .insert({
            line_user_id: profile.userId,
            name: profile.displayName || '司機',
            status: status,
            vehicle_type: '一般車輛',
            vehicle_brand: 'Toyota',
            vehicle_color: '白色',
            plate_number: 'ABC-1234'
          });
      } else {
        // 更新司機狀態
        await supabase
          .from('driver_profiles')
          .update({ 
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('line_user_id', profile.userId);
      }
    } catch (error) {
      console.error('更新司機狀態錯誤:', error);
    }
  };

  const handleOnlineToggle = async (checked: boolean) => {
    if (checked) {
      await getCurrentLocation();
      await updateDriverStatus('online');
    } else {
      await updateDriverStatus('offline');
    }
    setIsOnline(checked);
    
    toast({
      title: checked ? "已上線" : "已下線",
      description: checked ? "開始接收訂單通知" : "停止接收訂單通知",
    });
  };

  const acceptOrder = async (orderId: string) => {
    if (!profile?.userId || !isOnline) {
      toast({
        title: "無法接單",
        description: isOnline ? "請先上線" : "系統錯誤",
        variant: "destructive",
      });
      return;
    }

    try {
      // 獲取司機資料
      const { data: driverData } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('line_user_id', profile.userId)
        .single();

      const { error } = await supabase
        .from('call_records')
        .update({
          status: 'matched',
          driver_id: profile.userId,
          driver_name: driverData?.name || profile.displayName || '司機',
          driver_phone: driverData?.phone || '0900-000-000',
          driver_plate_number: driverData?.plate_number || 'ABC-1234',
          driver_car_brand: driverData?.vehicle_brand || 'Toyota',
          driver_car_color: driverData?.vehicle_color || '白色',
          accepted_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('status', 'waiting'); // 確保只能接受等待中的訂單

      if (error) {
        console.error('接單錯誤:', error);
        toast({
          title: "接單失敗",
          description: "此訂單可能已被其他司機接受",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "接單成功",
        description: "已成功接受訂單，乘客將收到通知",
      });

      loadOrders(); // 重新載入訂單列表
    } catch (error) {
      console.error('接單錯誤:', error);
      toast({
        title: "接單失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
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
      {/* 上線狀態控制 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="font-medium">{isOnline ? '已上線' : '離線'}</span>
            </div>
            <Switch
              checked={isOnline}
              onCheckedChange={handleOnlineToggle}
              disabled={isGettingLocation}
            />
          </div>
          
          {isOnline && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">當前位置</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  {isGettingLocation ? '定位中...' : '重新定位'}
                </Button>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800 break-words">
                  {currentLocation || '獲取位置中...'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
        ))
      )}
    </div>
  );
};

export default DriverOrders;
