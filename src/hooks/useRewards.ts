
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RewardStats {
  totalRewards: number;
  thisMonthRewards: number;
  availableForWithdrawal: number;
  completedOrders: number;
}

interface RewardHistory {
  id: string;
  date: string;
  orderAmount: number;
  rewardAmount: number;
  description: string;
}

export const useRewards = () => {
  const { profile } = useLiff();
  const { toast } = useToast();
  const [stats, setStats] = useState<RewardStats>({
    totalRewards: 0,
    thisMonthRewards: 0,
    availableForWithdrawal: 0,
    completedOrders: 0,
  });
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  const loadRewardData = async () => {
    if (!profile?.userId) return;

    try {
      const { data, error } = await supabase
        .from('call_records')
        .select('*')
        .eq('line_user_id', profile.userId)
        .eq('status', 'completed')
        .not('fare_amount', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('載入回饋資料錯誤:', error);
        return;
      }

      const orders = data || [];
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 計算回饋金額 (每筆訂單車資的2%)
      let totalRewards = 0;
      let thisMonthRewards = 0;
      const history: RewardHistory[] = [];

      orders.forEach(order => {
        const fareAmount = parseFloat(String(order.fare_amount));
        const rewardAmount = Math.round(fareAmount * 0.02); // 2%回饋
        totalRewards += rewardAmount;

        const orderDate = new Date(order.created_at);
        if (orderDate >= thisMonthStart) {
          thisMonthRewards += rewardAmount;
        }

        history.push({
          id: order.id,
          date: orderDate.toLocaleDateString('zh-TW'),
          orderAmount: fareAmount,
          rewardAmount: rewardAmount,
          description: `${order.car_type_label} - 完成訂單回饋`
        });
      });

      setStats({
        totalRewards: totalRewards,
        thisMonthRewards: thisMonthRewards,
        availableForWithdrawal: totalRewards, // 假設所有回饋都可提領
        completedOrders: orders.length,
      });

      setRewardHistory(history.slice(0, 10)); // 只顯示最近10筆
    } catch (error) {
      console.error('載入回饋資料錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (stats.availableForWithdrawal <= 0) {
      toast({
        title: "提領失敗",
        description: "目前沒有可提領的回饋金",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingWithdrawal(true);
    
    // 模擬提領申請處理
    setTimeout(() => {
      toast({
        title: "提領申請已送出",
        description: `申請提領 NT$ ${stats.availableForWithdrawal}，將於3-5個工作天內處理`,
      });
      setIsProcessingWithdrawal(false);
    }, 2000);
  };

  useEffect(() => {
    loadRewardData();
  }, [profile]);

  return {
    stats,
    rewardHistory,
    isLoading,
    isProcessingWithdrawal,
    handleWithdrawalRequest
  };
};
