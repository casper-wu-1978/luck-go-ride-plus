import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Clock, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallRecord {
  id: number;
  carType: string;
  carTypeLabel: string;
  status: 'waiting' | 'matched' | 'failed';
  timestamp: Date;
}

const CallCar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [carType, setCarType] = useState("unlimited");
  const [favoriteType, setFavoriteType] = useState("none");
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedAddressName, setSelectedAddressName] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const { toast } = useToast();

  // 模擬個資資訊
  const userProfile = {
    name: "王小明",
    phone: "0912-345-678",
    storeInfo: "小明商店 - 台北市信義區信義路五段7號"
  };

  // 模擬常用代碼數據
  const favoriteCodes = [
    { id: "A101", label: "A101" },
    { id: "B302", label: "B302" },
    { id: "VIP包廂", label: "VIP包廂" },
  ];

  // 模擬常用地址數據
  const favoriteAddresses = [
    { id: 1, name: "家裡", address: "台北市信義區信義路五段7號" },
    { id: 2, name: "公司", address: "台北市松山區敦化北路100號" },
  ];

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

  const handleCallCar = async () => {
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
    const newCallRecord: CallRecord = {
      id: Date.now(),
      carType,
      carTypeLabel: selectedCarType?.label || "不限",
      status: 'waiting',
      timestamp: new Date()
    };

    setCallRecords(prev => [newCallRecord, ...prev]);
    
    // 模擬叫車過程
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% 成功率
      
      setCallRecords(prev => 
        prev.map(record => 
          record.id === newCallRecord.id 
            ? { ...record, status: success ? 'matched' : 'failed' }
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
      
      setIsLoading(false);
    }, 3000);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return '等待媒合中...';
      case 'matched': return '媒合成功';
      case 'failed': return '媒合失敗';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-600';
      case 'matched': return 'text-green-600';
      case 'failed': return 'text-red-600';
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
            <CardTitle className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-2" />
              司機媒合狀態
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {callRecords.map((record) => (
                <div key={record.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-800">
                        {record.carTypeLabel}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {record.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                  </div>
                  
                  {record.status === 'waiting' && (
                    <div className="mt-2">
                      <Progress value={undefined} className="w-full h-2" />
                      <div className="text-xs text-gray-500 mt-1">
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
