
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";

interface UseDriverOrdersRealtimeProps {
  onOrderUpdate: () => void;
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: any;
  old?: any;
  errors?: any;
}

export const useDriverOrdersRealtime = ({ onOrderUpdate }: UseDriverOrdersRealtimeProps) => {
  const { toast } = useToast();
  const { profile } = useLiff();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!profile?.userId) {
      console.log('❌ 司機端 - 沒有用戶ID，跳過實時監聽設置');
      return;
    }

    // 檢查是否為測試用戶ID
    if (profile.userId.includes('12345') || profile.userId.includes('test')) {
      console.log('⚠️ 司機端 - 檢測到測試用戶ID，跳過實時監聽設置');
      return;
    }

    // 清理現有連接
    if (channelRef.current) {
      console.log('🧹 司機端 - 清理現有實時監聽器');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    console.log('🚗 司機端 - 設置新的實時監聽器:', profile.userId.substring(0, 10) + '...');
    
    // 創建唯一的頻道名稱
    const channelName = `driver_realtime_${profile.userId}_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_records'
        },
        async (payload: RealtimePayload) => {
          console.log('🚗🔥 司機收到資料庫變更:', {
            eventType: payload.eventType,
            recordId: payload.new?.id || payload.old?.id,
            status: payload.new?.status,
            oldStatus: payload.old?.status,
            timestamp: new Date().toISOString()
          });
          
          // 新的待接訂單通知 - 只顯示應用內通知
          if (payload.eventType === 'INSERT' && 
              payload.new?.status === 'waiting') {
            
            console.log('🚗🔔 發現新的待接訂單，顯示應用內通知:', {
              orderId: payload.new.id,
              carType: payload.new.car_type_label,
              favoriteType: payload.new.favorite_type
            });
            
            const location = payload.new.favorite_type === 'code' ? 
              `代碼: ${payload.new.favorite_info}` : 
              payload.new.favorite_type === 'address' ? 
              `地址: ${payload.new.favorite_info}` : '現在位置';
            
            // 顯示應用內通知
            toast({
              title: "🚕 新的待接訂單！",
              description: `${payload.new.car_type_label} - ${location}`,
              duration: 10000,
            });
            
            onOrderUpdate();
          }
          
          // 其他司機接單的通知（訂單被移除）
          if (payload.eventType === 'UPDATE' && 
              payload.old?.status === 'waiting' && 
              payload.new?.status === 'matched' &&
              payload.new?.driver_id !== profile.userId) {
            
            console.log('🚗💔 訂單被其他司機接走:', {
              orderId: payload.new.id,
              driverId: payload.new.driver_id
            });
            onOrderUpdate();
          }
          
          // 司機相關的訂單狀態更新
          if (payload.eventType === 'UPDATE' && 
              payload.new?.driver_id === profile.userId) {
            
            console.log('🚗📝 司機訂單狀態更新:', {
              orderId: payload.new.id,
              status: payload.new.status
            });
            onOrderUpdate();
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 司機實時監聽狀態變更:', status, '頻道:', channelName);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ 司機實時監聽已成功訂閱');
          isSubscribedRef.current = true;
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ 司機實時監聽超時，嘗試重新連接');
          isSubscribedRef.current = false;
        } else if (status === 'CLOSED') {
          console.log('❌ 司機實時監聽已關閉');
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;

    // 清理函數
    return () => {
      console.log('🧹 司機端 - 清理實時監聽器:', channelName);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [profile?.userId, onOrderUpdate, toast]);

  return {
    isConnected: isSubscribedRef.current
  };
};
