
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseCallRecordsRealtimeProps {
  lineUserId?: string;
  onRecordUpdate: (updatedRecord: any) => void;
}

export const useCallRecordsRealtime = ({ lineUserId, onRecordUpdate }: UseCallRecordsRealtimeProps) => {
  useEffect(() => {
    if (!lineUserId) {
      console.log('🔥 商家端 - 沒有用戶ID，跳過實時監聽設置');
      return;
    }

    console.log('🔥 商家端 - 設置實時監聽器:', lineUserId);

    const channel = supabase
      .channel(`merchant_call_records_${lineUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // 監聽所有事件
          schema: 'public',
          table: 'call_records',
          filter: `line_user_id=eq.${lineUserId}`
        },
        (payload) => {
          console.log('🔥🔥🔥 商家收到資料庫變更事件:', payload.eventType, payload);
          console.log('🔥🔥🔥 商家收到的 payload.new:', payload.new);
          console.log('🔥🔥🔥 商家收到的 payload.old:', payload.old);
          
          if (payload.eventType === 'UPDATE') {
            console.log('🔥🔥🔥 商家收到叫車記錄更新:', payload.new);
            console.log('🔥🔥🔥 商家收到更新 - 記錄狀態:', payload.new?.status);
            console.log('🔥🔥🔥 商家收到更新 - 司機名稱:', payload.new?.driver_name);
            console.log('🔥🔥🔥 商家即將調用onRecordUpdate');
            onRecordUpdate(payload.new);
            console.log('🔥🔥🔥 商家已調用onRecordUpdate完成');
          } else if (payload.eventType === 'INSERT') {
            console.log('🔥🔥🔥 商家收到新叫車記錄:', payload.new);
            onRecordUpdate(payload.new);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('🔥 商家實時監聽狀態:', status);
        if (err) {
          console.error('🔥 商家實時監聽錯誤:', err);
        }
        if (status === 'SUBSCRIBED') {
          console.log('🔥 商家實時監聽已成功訂閱');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('🔥 商家實時監聽頻道錯誤');
        } else if (status === 'TIMED_OUT') {
          console.error('🔥 商家實時監聽超時');
        }
      });

    // 測試連接狀態
    setTimeout(() => {
      console.log('🔥 商家端 - 實時監聽狀態檢查:', channel.state);
    }, 2000);

    return () => {
      console.log('🔥 商家端 - 清理實時監聽器');
      supabase.removeChannel(channel);
    };
  }, [lineUserId, onRecordUpdate]);
};
