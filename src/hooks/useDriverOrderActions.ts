
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { driverOrderService } from "@/services/driverOrderService";
import { updateCallRecord } from "@/utils/callCarApi";
import type { OrderCompletionData } from "@/types/driverOrders";

export const useDriverOrderActions = (onOrdersChanged: () => void) => {
  const { toast } = useToast();
  const { profile } = useLiff();

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
      // 先通過 driverOrderService 接單
      await driverOrderService.acceptOrder(orderId, profile.userId);
      
      // 然後更新訂單狀態並觸發 LINE 通知
      // 這裡需要從訂單中取得商家的 line_user_id
      const { data: orderData } = await supabase
        .from('call_records')
        .select('line_user_id, car_type_label')
        .eq('id', orderId)
        .single();

      if (orderData) {
        await updateCallRecord(orderId, 'matched', {
          name: profile.displayName || '司機',
          phone: '', // 這裡可以從司機資料中取得
          plateNumber: '',
          carBrand: '',
          carColor: ''
        }, orderData.line_user_id);
      }

      toast({
        title: "接單成功",
        description: "已成功接受訂單",
      });
      onOrdersChanged();
    } catch (error) {
      console.error('接單錯誤:', error);
      toast({
        title: "接單失敗",
        description: "無法接受訂單，請稍後再試",
        variant: "destructive"
      });
    }
  }, [profile?.userId, profile?.displayName, toast, onOrdersChanged]);

  const handleArriveOrder = useCallback(async (orderId: string) => {
    if (!profile?.userId) {
      toast({
        title: "登入錯誤",
        description: "無法獲取司機資訊",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('司機抵達訂單:', orderId, '司機ID:', profile.userId);
      
      // 先通過 driverOrderService 更新狀態
      await driverOrderService.arriveAtOrder(orderId, profile.userId);
      
      // 取得商家的 line_user_id 並發送通知
      const { data: orderData } = await supabase
        .from('call_records')
        .select('line_user_id')
        .eq('id', orderId)
        .single();

      if (orderData) {
        await updateCallRecord(orderId, 'arrived', undefined, orderData.line_user_id);
      }

      toast({
        title: "已抵達",
        description: "已通知乘客您已抵達上車地點",
      });
      onOrdersChanged();
    } catch (error: any) {
      console.error('抵達操作錯誤:', error);
      toast({
        title: "操作失敗",
        description: error.message || "無法完成抵達操作",
        variant: "destructive"
      });
    }
  }, [profile?.userId, toast, onOrdersChanged]);

  const handleCompleteOrder = useCallback(async (orderId: string, completionData?: OrderCompletionData) => {
    if (!profile?.userId) {
      toast({
        title: "登入錯誤",
        description: "無法獲取司機資訊",
        variant: "destructive"
      });
      return;
    }

    try {
      // 先通過 driverOrderService 完成訂單
      const result = await driverOrderService.completeOrder(orderId, profile.userId, completionData);
      
      // 取得商家的 line_user_id 並發送通知
      const { data: orderData } = await supabase
        .from('call_records')
        .select('line_user_id')
        .eq('id', orderId)
        .single();

      if (orderData) {
        const newStatus = result.newStatus === 'completed' ? 'completed' : 'in_progress';
        await updateCallRecord(orderId, newStatus, undefined, orderData.line_user_id);
      }

      toast({
        title: result.newStatus === 'completed' ? '訂單已完成' : '行程已開始',
        description: result.message,
      });
      onOrdersChanged();
    } catch (error: any) {
      console.error('完成訂單錯誤:', error);
      toast({
        title: "操作失敗",
        description: error.message || "無法完成訂單操作",
        variant: "destructive"
      });
    }
  }, [profile?.userId, toast, onOrdersChanged]);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    if (!profile?.userId) {
      toast({
        title: "登入錯誤",
        description: "無法獲取司機資訊",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('取消訂單:', orderId);
      
      // 先通過 driverOrderService 取消訂單
      await driverOrderService.cancelOrder(orderId, profile.userId);
      
      // 取得商家的 line_user_id 並發送通知
      const { data: orderData } = await supabase
        .from('call_records')
        .select('line_user_id')
        .eq('id', orderId)
        .single();

      if (orderData) {
        await updateCallRecord(orderId, 'cancelled', undefined, orderData.line_user_id);
      }

      toast({
        title: "已取消訂單",
        description: "訂單已成功取消",
      });
      onOrdersChanged();
    } catch (error) {
      console.error('取消訂單錯誤:', error);
      toast({
        title: "取消失敗",
        description: "無法取消訂單",
        variant: "destructive"
      });
    }
  }, [profile?.userId, toast, onOrdersChanged]);

  const handleNavigate = useCallback((orderId: string) => {
    // 這裡可以實作導航功能
    console.log('導航到訂單:', orderId);
    toast({
      title: "導航功能",
      description: "導航功能尚未實作",
    });
  }, [toast]);

  return {
    acceptOrder,
    handleArriveOrder,
    handleCompleteOrder,
    handleCancelOrder,
    handleNavigate
  };
};
