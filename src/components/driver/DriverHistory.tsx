
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Clock, Car } from "lucide-react";

interface DriverRecord {
  id: string;
  carTypeLabel: string;
  status: string;
  timestamp: Date;
  favoriteInfo?: string;
  favoriteType: string;
}

const DriverHistory = () => {
  const { profile } = useLiff();
  const [records, setRecords] = useState<DriverRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [profile]);

  const loadHistory = async () => {
    if (!profile?.userId) return;

    try {
      const { data, error } = await supabase
        .from('call_records')
        .select('*')
        .eq('driver_id', profile.userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('載入歷史紀錄錯誤:', error);
        return;
      }

      const formattedRecords = (data || []).map(record => ({
        id: record.id,
        carTypeLabel: record.car_type_label,
        status: record.status,
        timestamp: new Date(record.created_at),
        favoriteInfo: record.favorite_info || undefined,
        favoriteType: record.favorite_type,
      }));

      setRecords(formattedRecords);
    } catch (error) {
      console.error('載入歷史紀錄錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      waiting: { label: '等待中', variant: 'secondary' as const },
      matched: { label: '已接單', variant: 'default' as const },
      completed: { label: '已完成', variant: 'outline' as const },
      failed: { label: '失敗', variant: 'destructive' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-blue-800">載入歷史紀錄中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-2">接單紀錄</h2>
        <p className="text-blue-600">共 {records.length} 筆紀錄</p>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">尚無接單紀錄</p>
            <p className="text-sm text-gray-400 mt-2">完成第一筆訂單後會顯示在這裡</p>
          </CardContent>
        </Card>
      ) : (
        records.map((record) => {
          const statusInfo = getStatusBadge(record.status);
          return (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{record.carTypeLabel}</CardTitle>
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {record.timestamp.toLocaleString('zh-TW')}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {record.favoriteType === 'code' ? `代碼: ${record.favoriteInfo}` : 
                     record.favoriteType === 'address' ? `地址: ${record.favoriteInfo}` : '現在位置'}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default DriverHistory;
