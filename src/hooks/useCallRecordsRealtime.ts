
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseCallRecordsRealtimeProps {
  lineUserId?: string;
  onRecordUpdate: (updatedRecord: any) => void;
}

export const useCallRecordsRealtime = ({ lineUserId, onRecordUpdate }: UseCallRecordsRealtimeProps) => {
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!lineUserId) {
      console.log('❌ 商家端 - 沒有用戶ID，跳過實時監聽設置');
      return;
    }

    // 清理現有連接
    if (channelRef.current) {
      console.log('📞 清理現有實時監聽器');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    console.log('🔥 商家端 - 設置新的實時監聽器:', lineUserId);
    
    // 創建唯一的頻道名稱
    const channelName = `merchant_realtime_${lineUserId}_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_records',
          filter: `line_user_id=eq.${lineUserId}`
        },
        (payload) => {
          console.log('🔥🔥🔥 商家收到資料庫變更:', {
            eventType: payload.eventType,
            recordId: payload.new?.id || payload.old?.id,
            status: payload.new?.status,
            driver_name: payload.new?.driver_name,
            timestamp: new Date().toISOString()
          });
          
          if (payload.new) {
            console.log('🔥 處理記錄更新');
            onRecordUpdate(payload.new);
            
            // 顯示司機接單通知
            if (payload.eventType === 'UPDATE' && 
                payload.new.status === 'matched' && 
                payload.new.driver_name &&
                payload.old?.status !== 'matched') {
              
              toast({
                title: "叫車成功！",
                description: `司機 ${payload.new.driver_name} 已接單`,
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 商家實時監聽狀態變更:', status, '頻道:', channelName);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ 商家實時監聽已成功訂閱');
          isSubscribedRef.current = true;
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ 商家實時監聽超時，嘗試重新連接');
          isSubscribedRef.current = false;
        } else if (status === 'CLOSED') {
          console.log('❌ 商家實時監聽已關閉');
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;

    // 清理函數
    return () => {
      console.log('🧹 商家端 - 清理實時監聽器:', channelName);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [lineUserId, onRecordUpdate, toast]);

  // 返回連接狀態供調試使用
  return {
    isConnected: isSubscribedRef.current
  };
};
