
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

  const acceptOrder = async (orderId: string, isOnline: boolean) => {
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
        .eq('status', 'waiting');

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

      loadOrders();
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
