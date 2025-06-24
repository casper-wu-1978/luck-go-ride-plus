
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, Search, Phone, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DriverProfile {
  id: string;
  line_user_id: string | null;
  driver_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  vehicle_type: string | null;
  vehicle_brand: string | null;
  vehicle_color: string | null;
  plate_number: string | null;
  license_number: string | null;
  status: string | null;
  rating: number | null;
  join_date: string;
  created_at: string;
  updated_at: string;
}

const DriverManagement = () => {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DriverProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    const filtered = drivers.filter(driver =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.phone && driver.phone.includes(searchTerm)) ||
      (driver.line_user_id && driver.line_user_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDrivers(filtered);
  }, [drivers, searchTerm]);

  const loadDrivers = async () => {
    try {
      console.log('開始載入司機資料...');
      setDebugInfo('開始載入司機資料...');
      
      // 檢查當前用戶
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('當前用戶:', user);
      setDebugInfo(prev => prev + `\n當前用戶: ${user?.email || '未登入'}`);
      
      if (userError) {
        console.error('用戶驗證錯誤:', userError);
        setDebugInfo(prev => prev + `\n用戶驗證錯誤: ${userError.message}`);
      }

      // 嘗試載入司機資料
      const { data, error, count } = await supabase
        .from('driver_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      console.log('Supabase 查詢結果:', { data, error, count });
      setDebugInfo(prev => prev + `\nSupabase 查詢結果 - 資料: ${data?.length || 0} 筆, 錯誤: ${error?.message || '無'}, 總數: ${count}`);

      if (error) {
        console.error('載入司機資料錯誤:', error);
        setDebugInfo(prev => prev + `\n載入錯誤: ${error.message}`);
        throw error;
      }

      if (data) {
        console.log('設定司機資料到狀態中...', data);
        setDrivers(data);
        setDebugInfo(prev => prev + `\n成功載入 ${data.length} 筆司機資料`);
      } else {
        console.log('沒有司機資料');
        setDrivers([]);
        setDebugInfo(prev => prev + '\n沒有司機資料');
      }
    } catch (error) {
      console.error('載入司機資料錯誤:', error);
      setDebugInfo(prev => prev + `\n捕獲錯誤: ${error}`);
      toast({
        title: "載入失敗",
        description: "無法載入司機資料",
        variant: "destructive",
      });
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDriverStatus = async (driverId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        throw error;
      }

      setDrivers(prev => 
        prev.map(driver => 
          driver.id === driverId 
            ? { ...driver, status: newStatus, updated_at: new Date().toISOString() }
            : driver
        )
      );

      toast({
        title: "更新成功",
        description: `司機狀態已更新為 ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      console.error('更新司機狀態錯誤:', error);
      toast({
        title: "更新失敗",
        description: "無法更新司機狀態",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'online': return '上線';
      case 'offline': return '離線';
      case 'busy': return '忙碌';
      case 'suspended': return '停權';
      default: return '離線';
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">上線</Badge>;
      case 'offline':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">離線</Badge>;
      case 'busy':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">忙碌</Badge>;
      case 'suspended':
        return <Badge variant="destructive">停權</Badge>;
      default:
        return <Badge variant="outline">離線</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">司機管理</h2>
        </div>
        <Badge variant="secondary">{drivers.length} 位司機</Badge>
      </div>

      {/* 調試資訊卡片 */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertCircle className="h-5 w-5 mr-2" />
            調試資訊
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-orange-700 font-mono">
            {debugInfo}
          </pre>
        </CardContent>
      </Card>

      {/* 搜尋框 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋司機姓名、電話或LINE ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 司機列表 */}
      <Card>
        <CardHeader>
          <CardTitle>司機列表 ({filteredDrivers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LINE ID</TableHead>
                  <TableHead>名稱</TableHead>
                  <TableHead>聯絡方式</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>加入時間</TableHead>
                  <TableHead className="min-w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="font-mono text-sm text-gray-600">
                          {driver.line_user_id || '未提供'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-gray-900">{driver.name}</div>
                      </TableCell>
                      <TableCell>
                        {driver.phone ? (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-2 text-green-600" />
                            <span>{driver.phone}</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">未提供電話</div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(driver.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(driver.join_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {driver.status === 'suspended' ? (
                            <Button
                              size="sm"
                              onClick={() => updateDriverStatus(driver.id, 'offline')}
                              className="text-xs"
                            >
                              恢復
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDriverStatus(driver.id, 'suspended')}
                              className="text-xs"
                            >
                              停權
                            </Button>
                          )}
                          {driver.status !== 'online' && driver.status !== 'suspended' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateDriverStatus(driver.id, 'online')}
                              className="text-xs bg-green-600 hover:bg-green-700"
                            >
                              上線
                            </Button>
                          )}
                          {driver.status === 'online' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateDriverStatus(driver.id, 'offline')}
                              className="text-xs"
                            >
                              下線
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? '沒有找到符合條件的司機' : '暫無司機資料'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverManagement;
