
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseCallRecordsRealtimeProps {
  lineUserId?: string;
  onRecordUpdate: (updatedRecord: any) => void;
}

export const useCallRecordsRealtime = ({ lineUserId, onRecordUpdate }: UseCallRecordsRealtimeProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!lineUserId) {
      console.log('商家端 - 沒有用戶ID，跳過實時監聽設置');
      return;
    }

    console.log('🔥 商家端 - 設置實時監聽器:', lineUserId);
    
    // 使用固定的頻道名稱
    const channelName = `call_records_${lineUserId}`;
    
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
          console.log('🔥🔥🔥 商家收到資料庫變更事件:', payload.eventType, payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            console.log('🔥🔥🔥 商家收到訂單狀態更新:', payload.new);
            console.log('🔥🔥🔥 更新狀態:', payload.new?.status);
            console.log('🔥🔥🔥 司機資訊:', payload.new?.driver_name);
            
            // 立即調用更新函數
            onRecordUpdate(payload.new);
            
            // 顯示狀態更新通知
            if (payload.new?.status === 'matched') {
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
            onRecordUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔥 商家實時監聽狀態:', status);
        if (status === 'SUBSCRIBED') {
          console.log('🔥 商家實時監聽已成功訂閱');
        }
      });

    return () => {
      console.log('🔥 商家端 - 清理實時監聽器:', channelName);
      supabase.removeChannel(channel);
    };
  }, [lineUserId, onRecordUpdate, toast]);
};
