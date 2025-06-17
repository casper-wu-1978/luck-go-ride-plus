
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Car, Clock } from "lucide-react";
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
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const { toast } = useToast();

  const carTypes = [
    { id: "unlimited", label: "不限" },
    { id: "taxi", label: "小黃" },
    { id: "diverse", label: "多元" },
    { id: "private", label: "白牌" },
  ];

  const handleCallCar = async () => {
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
    <div className="space-y-6">
      {/* Simple +1 Call Car */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-emerald-700">
            <Car className="h-6 w-6 mr-2" />
            +1 叫車
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Car Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              車型選擇
            </Label>
            <RadioGroup value={carType} onValueChange={setCarType} className="flex flex-row space-x-6">
              {carTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label htmlFor={type.id} className="text-sm cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

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
