
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Car, Store, TrendingUp, LogOut } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";

interface OrderStats {
  total: number;
  waiting: number;
  matched: number;
  completed: number;
}

const Admin = () => {
  const { user, signOut } = useAdminAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    waiting: 0,
    matched: 0,
    completed: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
      loadRecentOrders();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('call_records')
        .select('status');

      if (error) {
        console.error('載入統計錯誤:', error);
        return;
      }

      const statsData = data?.reduce((acc, record) => {
        acc.total++;
        acc[record.status as keyof OrderStats]++;
        return acc;
      }, { total: 0, waiting: 0, matched: 0, completed: 0 }) || {
        total: 0, waiting: 0, matched: 0, completed: 0
      };

      setStats(statsData);
    } catch (error) {
      console.error('載入統計錯誤:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('call_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('載入訂單錯誤:', error);
        return;
      }

      setRecentOrders(data || []);
    } catch (error) {
      console.error('載入訂單錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "已登出",
        description: "您已成功登出管理系統",
      });
    } catch (error) {
      toast({
        title: "登出失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      waiting: { label: '等待中', variant: 'secondary' as const },
      matched: { label: '已媒合', variant: 'default' as const },
      completed: { label: '已完成', variant: 'outline' as const },
      failed: { label: '失敗', variant: 'destructive' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-purple-800">載入管理資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Sign Out */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-purple-800 mb-2">管理員控制台</h1>
            <p className="text-purple-600">系統總覽與管理</p>
            {user && (
              <p className="text-sm text-purple-500 mt-1">歡迎，{user.email}</p>
            )}
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            登出
          </Button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-600">總訂單</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.waiting}</p>
              <p className="text-sm text-gray-600">等待中</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.matched}</p>
              <p className="text-sm text-gray-600">已媒合</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Store className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
              <p className="text-sm text-gray-600">已完成</p>
            </CardContent>
          </Card>
        </div>

        {/* 最近訂單 */}
        <Card>
          <CardHeader>
            <CardTitle>最近訂單</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.car_type_label}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString('zh-TW')}
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
