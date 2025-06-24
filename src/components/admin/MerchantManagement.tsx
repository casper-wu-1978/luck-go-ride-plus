
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Store, Search, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MerchantProfile {
  id: string;
  line_user_id: string;
  business_name: string;
  contact_name: string;
  phone: string | null;
  email: string | null;
  business_address: string | null;
  business_type: string | null;
  status: string | null;
  created_at: string;
}

const MerchantManagement = () => {
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<MerchantProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMerchants();
  }, []);

  useEffect(() => {
    const filtered = merchants.filter(merchant =>
      merchant.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (merchant.phone && merchant.phone.includes(searchTerm))
    );
    setFilteredMerchants(filtered);
  }, [merchants, searchTerm]);

  const loadMerchants = async () => {
    try {
      const { data, error } = await supabase
        .from('merchant_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMerchants(data || []);
    } catch (error) {
      console.error('載入商家資料錯誤:', error);
      toast({
        title: "載入失敗",
        description: "無法載入商家資料",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMerchantStatus = async (merchantId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('merchant_profiles')
        .update({ status: newStatus })
        .eq('id', merchantId);

      if (error) {
        throw error;
      }

      setMerchants(prev => 
        prev.map(merchant => 
          merchant.id === merchantId 
            ? { ...merchant, status: newStatus }
            : merchant
        )
      );

      toast({
        title: "更新成功",
        description: `商家狀態已更新為 ${newStatus === 'active' ? '啟用' : '停用'}`,
      });
    } catch (error) {
      console.error('更新商家狀態錯誤:', error);
      toast({
        title: "更新失敗",
        description: "無法更新商家狀態",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">啟用</Badge>;
      case 'inactive':
        return <Badge variant="secondary">停用</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
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
          <Store className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">商家管理</h2>
        </div>
        <Badge variant="secondary">{merchants.length} 個商家</Badge>
      </div>

      {/* 搜尋框 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋商家名稱、聯絡人或電話..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 商家列表 */}
      <Card>
        <CardHeader>
          <CardTitle>商家列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商家名稱</TableHead>
                <TableHead>聯絡人</TableHead>
                <TableHead>聯絡方式</TableHead>
                <TableHead>地址</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>註冊時間</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMerchants.map((merchant) => (
                <TableRow key={merchant.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{merchant.business_name}</p>
                      <p className="text-sm text-gray-500">{merchant.business_type || '餐廳'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{merchant.contact_name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {merchant.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {merchant.phone}
                        </div>
                      )}
                      {merchant.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {merchant.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {merchant.business_address && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-xs" title={merchant.business_address}>
                          {merchant.business_address}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(merchant.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(merchant.created_at).toLocaleDateString('zh-TW')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      {merchant.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMerchantStatus(merchant.id, 'inactive')}
                        >
                          停用
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => updateMerchantStatus(merchant.id, 'active')}
                        >
                          啟用
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredMerchants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '沒有找到符合條件的商家' : '暫無商家資料'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantManagement;
