
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

  const sendLineNotification = async (userId: string, message: string) => {
    try {
      console.log('📤 發送 LINE 通知給司機:', { userId: userId.substring(0, 10) + '...', messageLength: message.length });
      
      // 驗證 LINE User ID 格式
      if (!userId || userId.length !== 33 || !userId.startsWith('U')) {
        console.error('❌ 無效的 LINE User ID 格式:', userId);
        return false;
      }
      
      const { data, error } = await supabase.functions.invoke('send-line-notification', {
        body: {
          userId: userId,
          message: message
        }
      });

      if (error) {
        console.error('❌ LINE 通知發送失敗:', error);
        return false;
      }

      console.log('✅ LINE 通知發送成功:', data);
      return true;
    } catch (error) {
      console.error('❌ 發送 LINE 通知異常:', error);
      return false;
    }
  };

  const notifyAllOnlineDrivers = async (orderData: any) => {
    try {
      console.log('🔔 開始通知所有線上司機新訂單:', orderData);
      
      // 獲取所有線上司機 - 更嚴格的篩選條件
      const { data: onlineDrivers, error } = await supabase
        .from('driver_profiles')
        .select('line_user_id, name, driver_id, status, updated_at')
        .eq('status', 'online')
        .not('line_user_id', 'is', null)
        .gte('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // 10分鐘內活躍

      if (error) {
        console.error('❌ 獲取線上司機失敗:', error);
        return;
      }

      if (!onlineDrivers || onlineDrivers.length === 0) {
        console.log('📭 目前沒有線上司機');
        return;
      }

      console.log(`📋 找到 ${onlineDrivers.length} 位線上司機:`, onlineDrivers.map(d => ({
        name: d.name,
        lineUserId: d.line_user_id?.substring(0, 10) + '...',
        status: d.status,
        updatedAt: d.updated_at
      })));

      const location = orderData.favorite_type === 'code' ? 
        `代碼: ${orderData.favorite_info}` : 
        orderData.favorite_type === 'address' ? 
        `地址: ${orderData.favorite_info}` : '現在位置';
      
      const lineMessage = `🚕 新訂單通知！\n\n車型：${orderData.car_type_label}\n上車位置：${location}\n\n請儘快查看並接單！`;

      // 發送通知給所有線上司機
      let successCount = 0;
      for (const driver of onlineDrivers) {
        try {
          console.log(`📤 發送通知給司機 ${driver.name}:`, {
            lineUserId: driver.line_user_id?.substring(0, 10) + '...',
            status: driver.status,
            updatedAt: driver.updated_at
          });
          
          const success = await sendLineNotification(driver.line_user_id, lineMessage);
          if (success) {
            successCount++;
            console.log(`✅ 成功通知司機 ${driver.name}`);
          } else {
            console.log(`❌ 通知司機 ${driver.name} 失敗`);
          }
          
          // 增加延遲避免 rate limit
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ 通知司機 ${driver.name} 異常:`, error);
        }
      }

      console.log(`🎯 新訂單通知完成：成功 ${successCount}/${onlineDrivers.length} 位司機`);
      
    } catch (error) {
      console.error('❌ 通知線上司機異常:', error);
    }
  };

  useEffect(() => {
    if (!profile?.userId) {
      console.log('❌ 司機端 - 沒有用戶ID，跳過實時監聽設置');
      return;
    }

    // 清理現有連接
    if (channelRef.current) {
      console.log('🧹 司機端 - 清理現有實時監聽器');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    console.log('🚗 司機端 - 設置新的實時監聽器:', profile.userId);
    
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
          
          // 新的待接訂單通知 - 只當有新訂單插入時觸發
          if (payload.eventType === 'INSERT' && 
              payload.new?.status === 'waiting') {
            
            console.log('🚗🔔 發現新的待接訂單，準備通知所有線上司機:', payload.new);
            
            const location = payload.new.favorite_type === 'code' ? 
              `代碼: ${payload.new.favorite_info}` : 
              payload.new.favorite_type === 'address' ? 
              `地址: ${payload.new.favorite_info}` : '現在位置';
            
            // 顯示應用內通知給當前司機
            toast({
              title: "🚕 新的待接訂單！",
              description: `${payload.new.car_type_label} - ${location}`,
              duration: 10000,
            });
            
            // 通知所有線上司機（這是關鍵功能）
            await notifyAllOnlineDrivers(payload.new);
            
            onOrderUpdate();
          }
          
          // 其他司機接單的通知（訂單被移除）
          if (payload.eventType === 'UPDATE' && 
              payload.old?.status === 'waiting' && 
              payload.new?.status === 'matched' &&
              payload.new?.driver_id !== profile.userId) {
            
            console.log('🚗💔 訂單被其他司機接走:', payload.new);
            onOrderUpdate();
          }
          
          // 司機相關的訂單狀態更新
          if (payload.eventType === 'UPDATE' && 
              payload.new?.driver_id === profile.userId) {
            
            console.log('🚗📝 司機訂單狀態更新:', payload.new);
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
