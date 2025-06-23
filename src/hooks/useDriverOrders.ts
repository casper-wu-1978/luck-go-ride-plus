
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";

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
  const [orders, setOrders] = useState<CallRecord[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useLiff();

  const loadOrders = useCallback(async () => {
    try {
      // 載入待接訂單 (status = 'waiting')
      const { data: waitingOrders, error: waitingError } = await supabase
        .from('call_records')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (waitingError) {
        console.error('載入待接訂單錯誤:', waitingError);
        return;
      }

      // 載入已接訂單 (status in ['matched', 'arrived', 'in_progress'])
      const { data: acceptedOrdersData, error: acceptedError } = await supabase
        .from('call_records')
        .select('*')
        .eq('driver_id', profile?.userId)
        .in('status', ['matched', 'arrived', 'in_progress'])
        .order('created_at', { ascending: false });

      if (acceptedError) {
        console.error('載入已接訂單錯誤:', acceptedError);
        return;
      }

      // 轉換資料格式
      const formattedWaitingOrders = (waitingOrders || []).map(order => ({
        id: order.id,
        carType: order.car_type,
        carTypeLabel: order.car_type_label,
        status: order.status,
        timestamp: new Date(order.created_at),
        favoriteType: order.favorite_type,
        favoriteInfo: order.favorite_info || undefined
      }));

      const formattedAcceptedOrders = (acceptedOrdersData || []).map(order => ({
        id: order.id,
        carType: order.car_type,
        carTypeLabel: order.car_type_label,
        status: order.status,
        timestamp: new Date(order.created_at),
        favoriteType: order.favorite_type,
        favoriteInfo: order.favorite_info || undefined
      }));

      setOrders(formattedWaitingOrders);
      setAcceptedOrders(formattedAcceptedOrders);
    } catch (error) {
      console.error('載入訂單錯誤:', error);
      toast({
        title: "載入失敗",
        description: "無法載入訂單資料",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile?.userId, toast]);

  const acceptOrder = useCallback(async (orderId: string, isOnline: boolean) => {
    if (!isOnline) {
      toast({
        title: "請先上線",
        description: "需要先上線才能接單",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.userId) {
      toast({
        title: "登入錯誤",
        description: "無法獲取司機資訊",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('call_records')
        .update({
          status: 'matched',
          driver_id: profile.userId,
          accepted_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('接單錯誤:', error);
        toast({
          title: "接單失敗",
          description: "無法接受訂單，請稍後再試",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "接單成功",
        description: "已成功接受訂單",
      });

      // 重新載入訂單
      loadOrders();
    } catch (error) {
      console.error('接單錯誤:', error);
      toast({
        title: "接單失敗",
        description: "發生未知錯誤",
        variant: "destructive"
      });
    }
  }, [profile?.userId, toast, loadOrders]);

  const handleArriveOrder = useCallback(async (orderId: string) => {
    try {
      console.log('司機抵達訂單:', orderId);
      
      const { error } = await supabase
        .from('call_records')
        .update({
          status: 'arrived'
        })
        .eq('id', orderId)
        .eq('driver_id', profile?.userId);

      if (error) {
        console.error('更新抵達狀態錯誤:', error);
        toast({
          title: "操作失敗",
          description: "無法更新抵達狀態",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "已抵達",
        description: "已通知乘客您已抵達上車地點",
      });

      // 重新載入訂單
      loadOrders();
    } catch (error) {
      console.error('抵達操作錯誤:', error);
      toast({
        title: "操作失敗",
        description: "無法完成抵達操作",
        variant: "destructive"
      });
    }
  }, [profile?.userId, toast, loadOrders]);

  const handleCompleteOrder = useCallback(async (orderId: string) => {
    try {
      // 先獲取當前訂單狀態
      const { data: currentOrder, error: fetchError } = await supabase
        .from('call_records')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchError || !currentOrder) {
        console.error('獲取訂單狀態錯誤:', fetchError);
        toast({
          title: "操作失敗",
          description: "無法獲取訂單狀態",
          variant: "destructive"
        });
        return;
      }

      let newStatus = '';
      let successMessage = '';

      // 根據當前狀態決定下一個狀態
      if (currentOrder.status === 'arrived') {
        newStatus = 'in_progress';
        successMessage = '行程已開始';
      } else if (currentOrder.status === 'in_progress') {
        newStatus = 'completed';
        successMessage = '訂單已完成';
      } else {
        toast({
          title: "操作失敗",
          description: "訂單狀態不正確",
          variant: "destructive"
        });
        return;
      }

      console.log('更新訂單狀態:', orderId, '從', currentOrder.status, '到', newStatus);
      
      const { error } = await supabase
        .from('call_records')
        .update({
          status: newStatus,
          ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
        })
        .eq('id', orderId)
        .eq('driver_id', profile?.userId);

      if (error) {
        console.error('更新訂單狀態錯誤:', error);
        toast({
          title: "操作失敗",
          description: "無法更新訂單狀態",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: successMessage,
        description: newStatus === 'completed' ? "感謝您的服務！" : "請安全駕駛",
      });

      // 重新載入訂單
      loadOrders();
    } catch (error) {
      console.error('完成訂單錯誤:', error);
      toast({
        title: "操作失敗",
        description: "無法完成訂單操作",
        variant: "destructive"
      });
    }
  }, [profile?.userId, toast, loadOrders]);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    try {
      console.log('取消訂單:', orderId);
      
      const { error } = await supabase
        .from('call_records')
        .update({
          status: 'cancelled',
          driver_id: null,
          accepted_at: null
        })
        .eq('id', orderId)
        .eq('driver_id', profile?.userId);

      if (error) {
        console.error('取消訂單錯誤:', error);
        toast({
          title: "取消失敗",
          description: "無法取消訂單",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "已取消訂單",
        description: "訂單已成功取消",
      });

      // 重新載入訂單
      loadOrders();
    } catch (error) {
      console.error('取消訂單錯誤:', error);
      toast({
        title: "取消失敗",
        description: "發生未知錯誤",
        variant: "destructive"
      });
    }
  }, [profile?.userId, toast, loadOrders]);

  const handleNavigate = useCallback((orderId: string) => {
    // 這裡可以實作導航功能
    console.log('導航到訂單:', orderId);
    toast({
      title: "導航功能",
      description: "導航功能尚未實作",
    });
  }, [toast]);

  useEffect(() => {
    if (profile?.userId) {
      loadOrders();
    }
  }, [profile?.userId, loadOrders]);

  return {
    orders,
    acceptedOrders,
    isLoading,
    loadOrders,
    acceptOrder,
    handleNavigate,
    handleCancelOrder,
    handleCompleteOrder,
    handleArriveOrder
  };
};
