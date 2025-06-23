
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseCallRecordsRealtimeProps {
  lineUserId?: string;
  onRecordUpdate: (updatedRecord: any) => void;
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: any;
  old?: any;
  errors?: any;
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
        (payload: RealtimePayload) => {
          console.log('🔥🔥🔥 商家收到資料庫變更:', {
            eventType: payload.eventType,
            recordId: payload.new?.id || payload.old?.id,
            status: payload.new?.status,
            driver_name: payload.new?.driver_name,
            oldStatus: payload.old?.status,
            timestamp: new Date().toISOString()
          });
          
          if (payload.new) {
            console.log('🔥 處理記錄更新');
            onRecordUpdate(payload.new);
            
            // 處理各種狀態變更的通知
            const newStatus = payload.new.status;
            const oldStatus = payload.old?.status;
            const driverName = payload.new.driver_name;
            
            // 司機接單通知
            if (payload.eventType === 'UPDATE' && 
                newStatus === 'matched' && 
                driverName &&
                oldStatus !== 'matched') {
              
              toast({
                title: "司機已接單！",
                description: `司機 ${driverName} 已接受您的叫車請求`,
                duration: 5000,
              });
            }
            
            // 司機已抵達通知
            if (payload.eventType === 'UPDATE' && 
                newStatus === 'arrived' && 
                driverName &&
                oldStatus !== 'arrived') {
              
              toast({
                title: "司機已抵達！",
                description: `司機 ${driverName} 已到達上車地點，請準備上車`,
                duration: 8000,
              });
            }
            
            // 行程開始通知
            if (payload.eventType === 'UPDATE' && 
                newStatus === 'in_progress' && 
                driverName &&
                oldStatus !== 'in_progress') {
              
              toast({
                title: "行程已開始！",
                description: `司機 ${driverName} 已開始行程`,
                duration: 5000,
              });
            }
            
            // 行程完成通知
            if (payload.eventType === 'UPDATE' && 
                newStatus === 'completed' && 
                driverName &&
                oldStatus !== 'completed') {
              
              toast({
                title: "行程已完成！",
                description: `感謝您使用我們的叫車服務`,
                duration: 6000,
              });
            }
            
            // 行程取消或失敗通知
            if (payload.eventType === 'UPDATE' && 
                (newStatus === 'cancelled' || newStatus === 'failed') &&
                oldStatus !== newStatus) {
              
              const message = newStatus === 'cancelled' ? '行程已取消' : '叫車失敗';
              toast({
                title: message,
                description: newStatus === 'cancelled' ? '行程已被取消' : '很抱歉，無法找到合適的司機',
                variant: "destructive",
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
