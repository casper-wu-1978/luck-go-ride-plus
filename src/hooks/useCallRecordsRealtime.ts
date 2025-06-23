
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseCallRecordsRealtimeProps {
  lineUserId?: string;
  onRecordUpdate: (updatedRecord: any) => void;
}

export const useCallRecordsRealtime = ({ lineUserId, onRecordUpdate }: UseCallRecordsRealtimeProps) => {
  const { toast } = useToast();

  // 使用 useCallback 來穩定 onRecordUpdate 函數
  const stableOnRecordUpdate = useCallback(onRecordUpdate, []);

  useEffect(() => {
    if (!lineUserId) {
      console.log('商家端 - 沒有用戶ID，跳過實時監聽設置');
      return;
    }

    console.log('🔥 商家端 - 設置實時監聽器:', lineUserId);
    
    // 使用更具體的頻道名稱，避免衝突
    const channelName = `merchant_call_records_${lineUserId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // 監聽所有事件
          schema: 'public',
          table: 'call_records',
          filter: `line_user_id=eq.${lineUserId}`
        },
        (payload) => {
          console.log('🔥🔥🔥 商家收到資料庫變更事件:', {
            eventType: payload.eventType,
            old: payload.old,
            new: payload.new,
            timestamp: new Date().toISOString()
          });
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            console.log('🔥🔥🔥 商家收到訂單狀態更新:', {
              id: payload.new.id,
              status: payload.new.status,
              driver_name: payload.new.driver_name,
              old_status: payload.old?.status
            });
            
            // 立即調用更新函數
            stableOnRecordUpdate(payload.new);
            
            // 顯示狀態更新通知
            if (payload.new?.status === 'matched' && payload.new.driver_name) {
              toast({
                title: "叫車成功！",
                description: `司機 ${payload.new.driver_name} 已接單`,
              });
            } else if (payload.new?.status === 'failed') {
              toast({
                title: "叫車失敗",
                description: "未能找到合適的司機，請稍後再試",
                variant: "destructive"
              });
            }
          } else if (payload.eventType === 'INSERT' && payload.new) {
            console.log('🔥🔥🔥 商家收到新訂單:', payload.new);
            stableOnRecordUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔥 商家實時監聽狀態:', status, '頻道:', channelName);
        if (status === 'SUBSCRIBED') {
          console.log('🔥 商家實時監聽已成功訂閱，頻道:', channelName);
        } else if (status === 'TIMED_OUT') {
          console.error('🔥 商家實時監聽超時，頻道:', channelName);
        } else if (status === 'CLOSED') {
          console.log('🔥 商家實時監聽已關閉，頻道:', channelName);
        }
      });

    return () => {
      console.log('🔥 商家端 - 清理實時監聽器:', channelName);
      supabase.removeChannel(channel);
    };
  }, [lineUserId, stableOnRecordUpdate, toast]);
};
