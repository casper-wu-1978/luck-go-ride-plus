import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, Calendar, DollarSign } from "lucide-react";

interface EarningsStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalOrders: number;
  completedOrders: number;
  averageEarnings: number;
}

const DriverEarnings = () => {
  const { profile } = useLiff();
  const [stats, setStats] = useState<EarningsStats>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalOrders: 0,
    completedOrders: 0,
    averageEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, [profile]);

  const loadEarnings = async () => {
    if (!profile?.userId) return;

    try {
      const { data, error } = await supabase
        .from('call_records')
        .select('*')
        .eq('driver_id', profile.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('載入收費統計錯誤:', error);
        return;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const records = data || [];
      const completedRecords = records.filter(r => r.status === 'completed' && r.fare_amount);
      
      // 計算今日收入
      const todayRecords = completedRecords.filter(r => 
        new Date(r.created_at) >= today && r.fare_amount
      );
      const todayEarnings = todayRecords.reduce((sum, r) => sum + parseFloat(String(r.fare_amount)), 0);

      // 計算本週收入
      const weeklyRecords = completedRecords.filter(r => 
        new Date(r.created_at) >= weekAgo && r.fare_amount
      );
      const weeklyEarnings = weeklyRecords.reduce((sum, r) => sum + parseFloat(String(r.fare_amount)), 0);

      // 計算本月收入
      const monthlyRecords = completedRecords.filter(r => 
        new Date(r.created_at) >= monthAgo && r.fare_amount
      );
      const monthlyEarnings = monthlyRecords.reduce((sum, r) => sum + parseFloat(String(r.fare_amount)), 0);

      // 計算平均收入
      const totalEarnings = completedRecords.reduce((sum, r) => sum + parseFloat(String(r.fare_amount)), 0);
      const averageEarnings = completedRecords.length > 0 ? totalEarnings / completedRecords.length : 0;

      setStats({
        todayEarnings: Math.round(todayEarnings),
        weeklyEarnings: Math.round(weeklyEarnings),
        monthlyEarnings: Math.round(monthlyEarnings),
        totalOrders: records.length,
        completedOrders: completedRecords.length,
        averageEarnings: Math.round(averageEarnings),
      });
    } catch (error) {
      console.error('載入收費統計錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-blue-800">載入收費統計中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-2">收費統計</h2>
        <p className="text-blue-600">檢視您的收入狀況</p>
      </div>

      {/* 收入統計卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">NT$ {stats.todayEarnings}</p>
            <p className="text-sm text-gray-600">今日收入</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">NT$ {stats.weeklyEarnings}</p>
            <p className="text-sm text-gray-600">本週收入</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">NT$ {stats.monthlyEarnings}</p>
            <p className="text-sm text-gray-600">本月收入</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.completedOrders}</p>
            <p className="text-sm text-gray-600">完成訂單</p>
          </CardContent>
        </Card>
      </div>

      {/* 詳細資訊 */}
      <Card>
        <CardHeader>
          <CardTitle>收入詳情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">總接單數</span>
              <span className="font-medium">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">完成訂單</span>
              <span className="font-medium">{stats.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">平均每單收入</span>
              <span className="font-medium">NT$ {stats.averageEarnings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">完成率</span>
              <span className="font-medium">
                {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverEarnings;
