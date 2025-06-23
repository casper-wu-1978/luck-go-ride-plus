
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { driverOrderService } from "@/services/driverOrderService";
import { useDriverOrderActions } from "@/hooks/useDriverOrderActions";
import type { CallRecord } from "@/types/driverOrders";

export const useDriverOrders = () => {
  const [orders, setOrders] = useState<CallRecord[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useLiff();

  const loadOrders = useCallback(async () => {
    try {
      // 載入待接訂單
      const waitingOrders = await driverOrderService.loadWaitingOrders();
      setOrders(waitingOrders);

      // 載入已接訂單
      if (profile?.userId) {
        const acceptedOrdersData = await driverOrderService.loadAcceptedOrders(profile.userId);
        setAcceptedOrders(acceptedOrdersData);
      }
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

  const orderActions = useDriverOrderActions(loadOrders);

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
    ...orderActions
  };
};
