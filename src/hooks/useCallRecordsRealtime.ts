
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseCallRecordsRealtimeProps {
  lineUserId?: string;
  onRecordUpdate: (updatedRecord: any) => void;
}

export const useCallRecordsRealtime = ({ lineUserId, onRecordUpdate }: UseCallRecordsRealtimeProps) => {
  useEffect(() => {
    if (!lineUserId) return;

    console.log('設置商家實時監聽器:', lineUserId);

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
          console.log('商家收到資料庫變更事件:', payload.eventType, payload);
          
          if (payload.eventType === 'UPDATE') {
            console.log('商家收到叫車記錄更新:', payload.new);
            onRecordUpdate(payload.new);
          } else if (payload.eventType === 'INSERT') {
            console.log('商家收到新叫車記錄:', payload.new);
            onRecordUpdate(payload.new);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('商家實時監聽狀態:', status);
        if (err) {
          console.error('商家實時監聽錯誤:', err);
        }
        if (status === 'SUBSCRIBED') {
          console.log('商家實時監聽已成功訂閱');
        }
      });

    return () => {
      console.log('清理商家實時監聽器');
      supabase.removeChannel(channel);
    };
  }, [lineUserId, onRecordUpdate]);
};
