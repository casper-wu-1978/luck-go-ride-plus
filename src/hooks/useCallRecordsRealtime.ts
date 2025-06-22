
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
      console.log('🔥 商家端 - 沒有用戶ID，跳過實時監聽設置');
      return;
    }

    console.log('🔥 商家端 - 設置實時監聽器:', lineUserId);
    
    // 顯示調試提示
    toast({
      title: "🔥 調試資訊",
      description: `商家端實時監聽器啟動 - 用戶ID: ${lineUserId.slice(-4)}`,
    });

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
          
          // 顯示收到變更事件的提示
          toast({
            title: "🔥 收到資料庫變更",
            description: `事件類型: ${payload.eventType}, 記錄ID: ${payload.new && typeof payload.new === 'object' && 'id' in payload.new ? (payload.new.id as string)?.slice(-4) || 'N/A' : 'N/A'}`,
          });
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            console.log('🔥🔥🔥 商家收到叫車記錄更新:', payload.new);
            console.log('🔥🔥🔥 商家收到更新 - 記錄狀態:', payload.new?.status);
            console.log('🔥🔥🔥 商家收到更新 - 司機名稱:', payload.new?.driver_name);
            console.log('🔥🔥🔥 商家即將調用onRecordUpdate');
            
            // 顯示記錄更新的詳細提示
            toast({
              title: "🔥 記錄狀態更新",
              description: `狀態: ${payload.new?.status} ${payload.new?.driver_name ? `- 司機: ${payload.new.driver_name}` : ''}`,
            });
            
            onRecordUpdate(payload.new);
            console.log('🔥🔥🔥 商家已調用onRecordUpdate完成');
          } else if (payload.eventType === 'INSERT' && payload.new) {
            console.log('🔥🔥🔥 商家收到新叫車記錄:', payload.new);
            onRecordUpdate(payload.new);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('🔥 商家實時監聽狀態:', status);
        if (err) {
          console.error('🔥 商家實時監聽錯誤:', err);
          toast({
            title: "🔥 監聽錯誤",
            description: `錯誤: ${err.message || '未知錯誤'}`,
            variant: "destructive"
          });
        }
        if (status === 'SUBSCRIBED') {
          console.log('🔥 商家實時監聽已成功訂閱');
          toast({
            title: "🔥 監聽成功",
            description: "商家端實時監聽已成功訂閱",
          });
        } else if (status === 'CHANNEL_ERROR') {
          console.error('🔥 商家實時監聽頻道錯誤');
          toast({
            title: "🔥 頻道錯誤",
            description: "實時監聽頻道發生錯誤",
            variant: "destructive"
          });
        } else if (status === 'TIMED_OUT') {
          console.error('🔥 商家實時監聽超時');
          toast({
            title: "🔥 監聽超時",
            description: "實時監聽連接超時",
            variant: "destructive"
          });
        }
      });

    // 測試連接狀態
    setTimeout(() => {
      console.log('🔥 商家端 - 實時監聽狀態檢查:', channel.state);
      toast({
        title: "🔥 連接狀態檢查",
        description: `監聽器狀態: ${channel.state}`,
      });
    }, 2000);

    return () => {
      console.log('🔥 商家端 - 清理實時監聽器');
      supabase.removeChannel(channel);
    };
  }, [lineUserId, onRecordUpdate, toast]);
};
