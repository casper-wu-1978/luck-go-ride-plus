
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Calendar, DollarSign, Loader2 } from "lucide-react";
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

const Rewards = () => {
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

  useEffect(() => {
    loadRewardData();
  }, [profile]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-green-800">載入回饋資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">回饋金管理</h2>
        <p className="text-green-600">每筆完成訂單可獲得車資2%回饋</p>
      </div>

      {/* 回饋金統計 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Coins className="h-8 w-8 mx-auto mb-2 opacity-90" />
            <p className="text-2xl font-bold">NT$ {stats.totalRewards}</p>
            <p className="text-sm opacity-90">累計回饋金</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-90" />
            <p className="text-2xl font-bold">NT$ {stats.thisMonthRewards}</p>
            <p className="text-sm opacity-90">本月回饋</p>
          </CardContent>
        </Card>
      </div>

      {/* 提領申請區域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <DollarSign className="h-5 w-5 mr-2" />
            提領申請
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-700 font-medium">可提領金額</span>
              <span className="text-2xl font-bold text-green-800">NT$ {stats.availableForWithdrawal}</span>
            </div>
            <p className="text-green-600 text-sm mb-4">
              回饋金每月月初可申請提領，不能抵扣車費
            </p>
            <Button 
              onClick={handleWithdrawalRequest}
              disabled={stats.availableForWithdrawal <= 0 || isProcessingWithdrawal}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessingWithdrawal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  處理中...
                </>
              ) : (
                '申請提領'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 回饋說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">回饋機制說明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-800 leading-relaxed">
                <strong>回饋計算：</strong>每筆完成的叫車訂單，平台收取司機車資的12%，其中2%回饋給商家
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 leading-relaxed">
                <strong>提領規則：</strong>回饋金僅能用於提領，無法抵扣車費。每月月初開放申請提領
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-amber-800 leading-relaxed">
                <strong>處理時間：</strong>提領申請送出後，將於3-5個工作天內處理完成
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近回饋紀錄 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <TrendingUp className="h-5 w-5 mr-2" />
            最近回饋紀錄
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rewardHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>尚無回饋紀錄</p>
              <p className="text-sm mt-2">完成訂單後會顯示回饋明細</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewardHistory.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{reward.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{reward.date}</span>
                      <span>訂單金額: NT$ {reward.orderAmount}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-600 font-medium text-lg">+NT$ {reward.rewardAmount}</span>
                    <p className="text-xs text-gray-500">2% 回饋</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Rewards;
