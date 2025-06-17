
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Car, User, Phone, MapPin, Hash, Building } from "lucide-react";
import { useLiff } from "@/contexts/LiffContext";
import { loadCallRecords } from "@/utils/callCarApi";
import { CallRecord } from "@/types/callCar";
import { UserProfile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";

const OrderHistory = () => {
  const { profile: liffProfile } = useLiff();
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (liffProfile?.userId) {
      loadData();
    }
  }, [liffProfile]);

  const loadData = async () => {
    if (!liffProfile?.userId) return;

    setIsLoading(true);
    try {
      // Load call records
      const records = await loadCallRecords(liffProfile.userId);
      setCallRecords(records);

      // Load user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('line_user_id', liffProfile.userId)
        .maybeSingle();

      if (!error && data) {
        setUserProfile({
          name: data.name || liffProfile.displayName || "用戶",
          phone: data.phone || "",
          email: data.email || "",
          business_name: data.business_name || "",
          business_address: data.business_address || ""
        });
      } else {
        // 如果沒有個人資料，使用 LIFF 預設資料
        setUserProfile({
          name: liffProfile.displayName || "用戶",
          phone: "",
          email: "",
          business_name: "",
          business_address: ""
        });
      }
    } catch (error) {
      console.error('載入資料錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return '等待中';
      case 'matched': return '已媒合';
      case 'failed': return '失敗';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'waiting': return 'secondary';
      case 'matched': return 'default';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">叫車紀錄</h2>
        <p className="text-emerald-600">查看您的所有叫車記錄</p>
      </div>

      {callRecords.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">目前沒有叫車記錄</p>
            <p className="text-gray-500 text-sm mt-2">您的叫車記錄會顯示在這裡</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {callRecords.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-emerald-600" />
                    <div>
                      <CardTitle className="text-lg">{record.carTypeLabel}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {record.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(record.status)}>
                    {getStatusText(record.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Driver Information */}
                {record.status === 'matched' && record.driverInfo && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-blue-800 font-medium text-sm mb-2">司機資訊</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center text-blue-700">
                        <User className="h-4 w-4 mr-2" />
                        <span className="text-sm ml-1">{record.driverInfo.name}</span>
                        <Phone className="h-4 w-4 ml-4 mr-1" />
                        <span className="text-sm">{record.driverInfo.phone}</span>
                      </div>
                      <div className="flex items-center text-blue-700">
                        <Car className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">車牌：</span>
                        <span className="text-sm ml-1">{record.driverInfo.plateNumber}</span>
                        <span className="text-sm ml-4 font-medium">品牌：</span>
                        <span className="text-sm ml-1">{record.driverInfo.carBrand}</span>
                        <span className="text-sm ml-4 font-medium">顏色：</span>
                        <span className="text-sm ml-1">{record.driverInfo.carColor}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* User Information */}
                {userProfile && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="text-green-800 font-medium text-sm mb-2">乘客資訊</div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center text-green-700">
                        <User className="h-4 w-4 mr-2" />
                        <span className="text-sm">{userProfile.name}</span>
                        {userProfile.phone && (
                          <>
                            <Phone className="h-4 w-4 ml-4 mr-1" />
                            <span className="text-sm">{userProfile.phone}</span>
                          </>
                        )}
                      </div>
                      {record.favoriteType !== "address" && userProfile.business_name && (
                        <>
                          <div className="flex items-center text-green-700">
                            <Building className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">上車點：</span>
                            <span className="text-sm ml-1">{userProfile.business_name}</span>
                          </div>
                          {userProfile.business_address && (
                            <div className="flex items-center text-green-700">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="text-sm">{userProfile.business_address}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Favorite Information */}
                {record.favoriteInfo && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center text-blue-700">
                      {record.favoriteType === "code" ? (
                        <Hash className="h-4 w-4 mr-2" />
                      ) : (
                        <MapPin className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {record.favoriteType === "code" ? "代碼" : "地址"}：
                      </span>
                      <span className="text-sm ml-1">{record.favoriteInfo}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
