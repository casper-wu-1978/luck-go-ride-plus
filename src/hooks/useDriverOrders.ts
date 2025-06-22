
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: string;
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
}

export const useDriverOrders = () => {
  const { profile } = useLiff();
  const { toast } = useToast();
  const [orders, setOrders] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  // 實時監聽新訂單和訂單狀態變化
  useEffect(() => {
    console.log('設置司機實時監聽器 - 新訂單和狀態更新');
    
    const channel = supabase
      .channel('driver_orders_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_records',
          filter: 'status=eq.waiting'
        },
        (payload) => {
          console.log('司機收到新訂單:', payload);
          const newRecord = payload.new;
          const formattedOrder = {
            id: newRecord.id,
            carType: newRecord.car_type,
            carTypeLabel: newRecord.car_type_label,
            status: newRecord.status,
            timestamp: new Date(newRecord.created_at),
            favoriteType: newRecord.favorite_type,
            favoriteInfo: newRecord.favorite_info || undefined,
          };
          
          setOrders(prev => [formattedOrder, ...prev]);
          
          toast({
            title: "新的叫車請求",
            description: "有新的乘客需要叫車服務",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_records'
        },
        (payload) => {
          console.log('司機收到訂單狀態更新:', payload);
          const updatedRecord = payload.new;
          
          // 如果訂單被接受或取消，從待接列表中移除
          if (updatedRecord.status !== 'waiting') {
            setOrders(prev => prev.filter(order => order.id !== updatedRecord.id));
            console.log('移除已處理的訂單:', updatedRecord.id, '狀態:', updatedRecord.status);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('司機實時監聽狀態:', status);
        if (err) {
          console.error('司機實時監聽錯誤:', err);
        }
        if (status === 'SUBSCRIBED') {
          console.log('司機實時監聽已成功訂閱');
        }
      });

    return () => {
      console.log('清理司機實時監聽器');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const loadOrders = async () => {
    try {
      console.log('載入待接訂單...');
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
      console.log('載入待接訂單:', formattedOrders.length, '筆');
    } catch (error) {
      console.error('載入訂單錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptOrder = async (orderId: string, isOnline: boolean) => {
    if (!profile?.userId || !isOnline) {
      toast({
        title: "無法接單",
        description: isOnline ? "系統錯誤" : "請先上線",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('開始接單流程:', orderId);
      
      // 獲取司機資料
      const { data: driverData } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('line_user_id', profile.userId)
        .maybeSingle();

      console.log('司機資料:', driverData);

      // 嘗試接單（使用樂觀鎖定）
      const { data: updatedRecord, error } = await supabase
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
        .eq('status', 'waiting') // 確保只有等待中的訂單才能被接受
        .select()
        .maybeSingle();

      if (error) {
        console.error('接單錯誤:', error);
        toast({
          title: "接單失敗",
          description: "系統錯誤，請稍後再試",
          variant: "destructive",
        });
        return;
      }

      if (!updatedRecord) {
        toast({
          title: "接單失敗",
          description: "此訂單可能已被其他司機接受",
          variant: "destructive",
        });
        // 重新載入訂單列表
        loadOrders();
        return;
      }

      console.log('接單成功:', updatedRecord);
      toast({
        title: "接單成功",
        description: "已成功接受訂單，乘客將收到通知",
      });

      // 立即移除已接受的訂單（樂觀更新）
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
    } catch (error) {
      console.error('接單錯誤:', error);
      toast({
        title: "接單失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
    }
  };

  return {
    orders,
    isLoading,
    loadOrders,
    acceptOrder
  };
};
