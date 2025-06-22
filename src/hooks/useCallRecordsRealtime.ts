
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
          event: 'UPDATE',
          schema: 'public',
          table: 'call_records',
          filter: `line_user_id=eq.${lineUserId}`
        },
        (payload) => {
          console.log('商家收到叫車記錄更新:', payload);
          onRecordUpdate(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_records',
          filter: `line_user_id=eq.${lineUserId}`
        },
        (payload) => {
          console.log('商家收到新叫車記錄:', payload);
          onRecordUpdate(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('商家實時監聽狀態:', status);
      });

    return () => {
      console.log('清理商家實時監聽器');
      supabase.removeChannel(channel);
    };
  }, [lineUserId, onRecordUpdate]);
};
