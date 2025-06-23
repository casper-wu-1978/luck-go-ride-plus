
import { useState, useEffect } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Clock, Car, Navigation, DollarSign } from "lucide-react";

interface DriverRecord {
  id: string;
  carTypeLabel: string;
  status: string;
  timestamp: Date;
  favoriteInfo?: string;
  favoriteType: string;
  destinationAddress?: string;
  distanceKm?: number;
  fareAmount?: number;
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
        destinationAddress: record.destination_address || undefined,
        distanceKm: record.distance_km || undefined,
        fareAmount: record.fare_amount || undefined,
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
      arrived: { label: '已抵達', variant: 'default' as const },
      in_progress: { label: '行程中', variant: 'default' as const },
      completed: { label: '已完成', variant: 'outline' as const },
      failed: { label: '失敗', variant: 'destructive' as const },
      cancelled: { label: '已取消', variant: 'secondary' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const getPickupLocationText = (favoriteType: string, favoriteInfo?: string) => {
    if (favoriteType === 'code') {
      return `代碼: ${favoriteInfo}`;
    } else if (favoriteType === 'address') {
      return `地址: ${favoriteInfo}`;
    } else {
      return '現在位置';
    }
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
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {record.timestamp.toLocaleString('zh-TW')}
                  </div>
                  
                  {/* 上車點 */}
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                    <div>
                      <span className="font-medium text-green-700">上車點: </span>
                      {getPickupLocationText(record.favoriteType, record.favoriteInfo)}
                    </div>
                  </div>

                  {/* 目的地 (只在有資料時顯示) */}
                  {record.destinationAddress && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Navigation className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                      <div>
                        <span className="font-medium text-red-700">目的地: </span>
                        {record.destinationAddress}
                      </div>
                    </div>
                  )}

                  {/* 距離和金額 (只在已完成的訂單中顯示) */}
                  {record.status === 'completed' && (record.distanceKm || record.fareAmount) && (
                    <div className="bg-blue-50 p-3 rounded-lg mt-3">
                      <h4 className="font-semibold text-blue-800 mb-2">行程資訊</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {record.distanceKm && (
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-1 text-blue-600" />
                            <span className="font-medium">距離: </span>
                            <span>{record.distanceKm} 公里</span>
                          </div>
                        )}
                        {record.fareAmount && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                            <span className="font-medium">車資: </span>
                            <span>NT$ {record.fareAmount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
