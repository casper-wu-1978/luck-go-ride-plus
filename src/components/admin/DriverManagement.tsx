
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, Search, Phone, Mail, Star, Calendar, User, IdCard } from 'lucide-react';
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
  const { toast } = useToast();

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    console.log('司機資料狀態更新:', drivers);
    console.log('司機資料數量:', drivers.length);
    
    const filtered = drivers.filter(driver =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.phone && driver.phone.includes(searchTerm)) ||
      (driver.plate_number && driver.plate_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (driver.driver_id && driver.driver_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    console.log('過濾後的司機資料:', filtered);
    setFilteredDrivers(filtered);
  }, [drivers, searchTerm]);

  const loadDrivers = async () => {
    try {
      console.log('開始載入司機資料...');
      
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase 查詢結果:', { data, error });

      if (error) {
        console.error('載入司機資料錯誤:', error);
        throw error;
      }

      console.log('載入的司機資料:', data);
      console.log('司機資料類型:', typeof data);
      console.log('是否為陣列:', Array.isArray(data));
      
      if (data) {
        console.log('設定司機資料到狀態中...');
        setDrivers(data);
        console.log('司機資料已設定，數量:', data.length);
      } else {
        console.log('沒有司機資料');
        setDrivers([]);
      }
    } catch (error) {
      console.error('載入司機資料錯誤:', error);
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

  const getRatingStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400 text-sm">未評分</span>;
    return (
      <div className="flex items-center">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  console.log('渲染組件，當前狀態:', {
    isLoading,
    driversCount: drivers.length,
    filteredDriversCount: filteredDrivers.length
  });

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

      {/* 搜尋框 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋司機姓名、電話、車牌號碼或司機ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 調試資訊 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">調試資訊</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>載入狀態: {isLoading ? '載入中' : '已完成'}</p>
            <p>原始司機數量: {drivers.length}</p>
            <p>過濾後司機數量: {filteredDrivers.length}</p>
            <p>搜尋條件: "{searchTerm}"</p>
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
                  <TableHead className="min-w-[200px]">司機資訊</TableHead>
                  <TableHead className="min-w-[150px]">聯絡方式</TableHead>
                  <TableHead className="min-w-[200px]">車輛資訊</TableHead>
                  <TableHead>評分</TableHead>
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
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="min-h-0">
                            <p className="font-semibold text-gray-900">{driver.name}</p>
                            <div className="space-y-1 text-sm text-gray-500">
                              <div className="flex items-center">
                                <IdCard className="h-3 w-3 mr-1" />
                                司機ID: {driver.driver_id}
                              </div>
                              {driver.license_number && (
                                <div>駕照: {driver.license_number}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {driver.phone ? (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-2 text-green-600" />
                              <span>{driver.phone}</span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">未提供電話</div>
                          )}
                          {driver.email ? (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-2 text-blue-600" />
                              <span className="truncate max-w-[120px]" title={driver.email}>
                                {driver.email}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">未提供信箱</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {driver.vehicle_brand || driver.vehicle_color ? (
                            <div className="text-sm">
                              <span className="font-medium">
                                {driver.vehicle_brand || '未知品牌'}
                              </span>
                              {driver.vehicle_color && (
                                <span className="text-gray-600 ml-1">({driver.vehicle_color})</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">未提供車輛品牌</div>
                          )}
                          
                          {driver.plate_number ? (
                            <div className="inline-block bg-blue-50 border border-blue-200 px-2 py-1 rounded text-sm font-mono">
                              {driver.plate_number}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">未提供車牌</div>
                          )}
                          
                          {driver.vehicle_type && (
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded inline-block">
                              {driver.vehicle_type}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRatingStars(driver.rating)}</TableCell>
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
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
