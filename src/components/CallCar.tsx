
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CallCar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [carType, setCarType] = useState("unlimited");
  const { toast } = useToast();

  const carTypes = [
    { id: "unlimited", label: "不限", isDefault: true },
    { id: "taxi", label: "小黃", isDefault: false },
    { id: "diverse", label: "多元", isDefault: false },
    { id: "private", label: "白牌", isDefault: false },
  ];

  const handleCallCar = async () => {
    setIsLoading(true);
    
    const selectedCarType = carTypes.find(type => type.id === carType);
    
    // 模擬叫車過程
    setTimeout(() => {
      toast({
        title: "叫車成功！",
        description: `已呼叫${selectedCarType?.label}車型，司機預計5分鐘後到達`,
      });
      setIsLoading(false);
    }, 2000);
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
            <RadioGroup value={carType} onValueChange={setCarType} className="space-y-2">
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
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                叫車中...
              </div>
            ) : (
              "+1 叫車"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallCar;
