
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Clock, Hash, X, MapPin, User, Phone, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { supabase } from "@/integrations/supabase/client";

interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: 'waiting' | 'matched' | 'failed' | 'cancelled';
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
  driverInfo?: {
    name: string;
    phone: string;
    plateNumber: string;
    carBrand: string;
    carColor: string;
  };
}

const CallCar = () => {
  const { profile: liffProfile } = useLiff();
  const [isLoading, setIsLoading] = useState(false);
  const [carType, setCarType] = useState("unlimited");
  const [favoriteType, setFavoriteType] = useState("none");
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedAddressName, setSelectedAddressName] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [favoriteCodes, setFavoriteCodes] = useState<Array<{id: string, label: string}>>([]);
  const [favoriteAddresses, setFavoriteAddresses] = useState<Array<{id: number, name: string, address: string}>>([]);
  const { toast } = useToast();

  // 模擬個資資訊
  const userProfile = {
    name: "林小姐",
    phone: "0912-345-678",
    businessName: "林記小吃店",
    businessAddress: "台北市大安區忠孝東路四段123號"
  };

  const carTypes = [
    { id: "unlimited", label: "不限" },
    { id: "taxi", label: "小黃" },
    { id: "diverse", label: "多元" },
    { id: "private", label: "白牌" },
    { id: "driver", label: "代駕" },
  ];

  const favoriteTypes = [
    { id: "none", label: "無選擇" },
    { id: "code", label: "代碼" },
    { id: "address", label: "住址" },
  ];

  // 載入常用地址和代碼
  const loadFavorites = async () => {
    if (!liffProfile?.userId) return;

    try {
      const { data, error } = await supabase
        .from('favorite_addresses')
        .select('*')
        .eq('line_user_id', liffProfile.userId);

      if (error) {
        console.error('載入常用資料錯誤:', error);
        return;
      }

      const codes: Array<{id: string, label: string}> = [];
      const addresses: Array<{id: number, name: string, address: string}> = [];

      data?.forEach(item => {
        if (item.address_type === 'code' && item.code) {
          codes.push({ id: item.code, label: item.code });
        } else if (item.address_type === 'address' && item.address) {
          addresses.push({ id: parseInt(item.id), name: item.name, address: item.address });
        }
      });

      setFavoriteCodes(codes);
      setFavoriteAddresses(addresses);
    } catch (error) {
      console.error('載入常用資料錯誤:', error);
    }
  };

  // 載入叫車記錄
  const loadCallRecords = async () => {
    if (!liffProfile?.userId) return;

    try {
      const { data, error } = await supabase
        .from('call_records')
        .select('*')
        .eq('line_user_id', liffProfile.userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('載入叫車記錄錯誤:', error);
        return;
      }

      const formattedRecords: CallRecord[] = (data || []).map(record => ({
        id: record.id,
        carType: record.car_type,
        carTypeLabel: record.car_type_label,
        status: record.status as 'waiting' | 'matched' | 'failed' | 'cancelled',
        timestamp: new Date(record.created_at),
        favoriteType: record.favorite_type,
        favoriteInfo: record.favorite_info || undefined,
        driverInfo: record.driver_name ? {
          name: record.driver_name,
          phone: record.driver_phone || '',
          plateNumber: record.driver_plate_number || '',
          carBrand: record.driver_car_brand || '',
          carColor: record.driver_car_color || ''
        } : undefined
      }));

      setCallRecords(formattedRecords);
    } catch (error) {
      console.error('載入叫車記錄錯誤:', error);
    }
  };

  useEffect(() => {
    if (liffProfile?.userId) {
      loadFavorites();
      loadCallRecords();
    }
  }, [liffProfile]);

  const handleCallCar = async () => {
    if (!liffProfile?.userId) {
      toast({
        title: "請先登入",
        description: "需要登入才能叫車",
        variant: "destructive"
      });
      return;
    }

    if (favoriteType === "code" && !selectedCode) {
      toast({
        title: "請選擇代碼",
        description: "請選擇一個代碼",
        variant: "destructive"
      });
      return;
    }

    if (favoriteType === "address" && (!selectedAddressName || !selectedAddress)) {
      toast({
        title: "請選擇地址",
        description: "請選擇一個地址",
        variant: "destructive"
      });
      return;
    }

    if (callRecords.length >= 10) {
      toast({
        title: "叫車次數已達上限",
        description: "最多只能叫10次車",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const selectedCarType = carTypes.find(type => type.id === carType);
    
    // Prepare favorite info for display
    let favoriteInfo = "";
    if (favoriteType === "code" && selectedCode) {
      favoriteInfo = selectedCode;
    } else if (favoriteType === "address" && selectedAddressName) {
      favoriteInfo = `${selectedAddressName}: ${selectedAddress}`;
    }
    
    try {
      // 插入新的叫車記錄到資料庫
      const { data: newRecord, error } = await supabase
        .from('call_records')
        .insert({
          line_user_id: liffProfile.userId,
          car_type: carType,
          car_type_label: selectedCarType?.label || "不限",
          status: 'waiting',
          favorite_type: favoriteType,
          favorite_info: favoriteInfo || null
        })
        .select()
        .single();

      if (error) {
        console.error('插入叫車記錄錯誤:', error);
        toast({
          title: "叫車失敗",
          description: "無法儲存叫車記錄",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const newCallRecord: CallRecord = {
        id: newRecord.id,
        carType: newRecord.car_type,
        carTypeLabel: newRecord.car_type_label,
        status: newRecord.status as 'waiting' | 'matched' | 'failed' | 'cancelled',
        timestamp: new Date(newRecord.created_at),
        favoriteType: newRecord.favorite_type,
        favoriteInfo: newRecord.favorite_info || undefined
      };

      setCallRecords(prev => [newCallRecord, ...prev.slice(0, 9)]);
      
      // 模擬叫車過程
      setTimeout(async () => {
        const success = Math.random() > 0.3; // 70% 成功率
        
        // Generate mock driver info if successful
        const driverInfo = success ? {
          name: "王師傅",
          phone: "0987-654-321",
          plateNumber: "ABC-1234",
          carBrand: "Toyota",
          carColor: "白色"
        } : undefined;
        
        try {
          // 更新資料庫中的記錄狀態
          const { error: updateError } = await supabase
            .from('call_records')
            .update({
              status: success ? 'matched' : 'failed',
              driver_name: driverInfo?.name || null,
              driver_phone: driverInfo?.phone || null,
              driver_plate_number: driverInfo?.plateNumber || null,
              driver_car_brand: driverInfo?.carBrand || null,
              driver_car_color: driverInfo?.carColor || null
            })
            .eq('id', newRecord.id);

          if (updateError) {
            console.error('更新叫車記錄錯誤:', updateError);
          }

          setCallRecords(prev => 
            prev.map(record => 
              record.id === newRecord.id 
                ? { ...record, status: success ? 'matched' : 'failed', driverInfo }
                : record
            )
          );

          if (success) {
            toast({
              title: "叫車成功！",
              description: `已媒合${selectedCarType?.label}司機，預計5分鐘後到達`,
            });
          } else {
            toast({
              title: "叫車失敗",
              description: "未能找到合適的司機，請稍後再試",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('更新叫車記錄錯誤:', error);
        }
        
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.error('叫車錯誤:', error);
      toast({
        title: "叫車失敗",
        description: "發生未知錯誤",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleCancelCall = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('call_records')
        .update({ status: 'cancelled' })
        .eq('id', recordId);

      if (error) {
        console.error('取消叫車錯誤:', error);
        toast({
          title: "取消失敗",
          description: "無法取消叫車",
          variant: "destructive"
        });
        return;
      }

      setCallRecords(prev => 
        prev.map(record => 
          record.id === recordId 
            ? { ...record, status: 'cancelled' }
            : record
        )
      );

      toast({
        title: "已取消叫車",
        description: "您的叫車請求已成功取消",
      });
    } catch (error) {
      console.error('取消叫車錯誤:', error);
      toast({
        title: "取消失敗",
        description: "發生未知錯誤",
        variant: "destructive"
      });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return '等待媒合中...';
      case 'matched': return '媒合成功';
      case 'failed': return '媒合失敗';
      case 'cancelled': return '已取消';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-600';
      case 'matched': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Simple +1 Call Car */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-emerald-700">
            <Car className="h-6 w-6 mr-2" />
            +1 叫車
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Car Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              車型選擇
            </Label>
            <RadioGroup value={carType} onValueChange={setCarType} className="flex flex-row space-x-4">
              {carTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-1">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label htmlFor={type.id} className="text-sm cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Favorite Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              常用選擇
            </Label>
            <RadioGroup value={favoriteType} onValueChange={setFavoriteType} className="flex flex-row space-x-4">
              {favoriteTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-1">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label htmlFor={type.id} className="text-sm cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Code Selection - Only when favoriteType is "code" */}
          {favoriteType === "code" && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                <Hash className="h-4 w-4 inline mr-1" />
                代碼
              </Label>
              <Select value={selectedCode} onValueChange={setSelectedCode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="請選擇代碼" />
                </SelectTrigger>
                <SelectContent>
                  {favoriteCodes.map((code) => (
                    <SelectItem key={code.id} value={code.id}>
                      {code.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Address Selection - Only when favoriteType is "address" */}
          {favoriteType === "address" && (
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  選擇地址
                </Label>
                <Select 
                  value={selectedAddressName} 
                  onValueChange={(value) => {
                    setSelectedAddressName(value);
                    const address = favoriteAddresses.find(addr => addr.name === value);
                    setSelectedAddress(address?.address || "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="請選擇地址" />
                  </SelectTrigger>
                  <SelectContent>
                    {favoriteAddresses.map((address) => (
                      <SelectItem key={address.id} value={address.name}>
                        {address.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAddress && (
                <div>
                  <Label htmlFor="selectedAddress" className="text-sm font-medium text-gray-700 mb-1 block">
                    住址
                  </Label>
                  <Input
                    id="selectedAddress"
                    value={selectedAddress}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              )}
            </div>
          )}

          {/* Call Button */}
          <Button 
            onClick={handleCallCar} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-xl font-medium"
            disabled={isLoading || callRecords.length >= 10}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                叫車中...
              </div>
            ) : (
              `+1 叫車 (${callRecords.length}/10)`
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Call Records */}
      {callRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-700 text-xl">
              <Clock className="h-6 w-6 mr-2" />
              司機媒合狀態
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {callRecords.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-semibold text-gray-800 text-lg">
                        {record.carTypeLabel}
                      </span>
                      <span className="text-base text-gray-600 ml-3">
                        {record.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-base font-semibold ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                      {record.status === 'waiting' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelCall(record.id)}
                          className="h-7 px-3 text-sm border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        >
                          <X className="h-4 w-4 mr-1" />
                          取消
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Driver Information - Only show when matched */}
                  {record.status === 'matched' && record.driverInfo && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
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
                  
                  {/* User Profile Information - Only show business info if no address is selected */}
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center text-green-700">
                        <User className="h-4 w-4 mr-2" />
                        <span className="text-sm">{userProfile.name}</span>
                        <Phone className="h-4 w-4 ml-4 mr-1" />
                        <span className="text-sm">{userProfile.phone}</span>
                      </div>
                      {record.favoriteType !== "address" && (
                        <>
                          <div className="flex items-center text-green-700">
                            <Building className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">上車點：</span>
                            <span className="text-sm ml-1">{userProfile.businessName}</span>
                          </div>
                          <div className="flex items-center text-green-700">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{userProfile.businessAddress}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Display favorite choice info */}
                  {record.favoriteInfo && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
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
                  
                  {record.status === 'waiting' && (
                    <div className="mt-3">
                      <Progress value={undefined} className="w-full h-3" />
                      <div className="text-sm text-gray-600 mt-2">
                        正在為您尋找最適合的司機...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CallCar;
