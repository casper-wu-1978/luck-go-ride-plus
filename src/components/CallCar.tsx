
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CallCar = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCallCar = async () => {
    if (!pickup || !destination) {
      toast({
        title: "請填寫完整資訊",
        description: "請輸入上車地點和目的地",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // 模擬叫車過程
    setTimeout(() => {
      toast({
        title: "叫車成功！",
        description: "司機預計5分鐘後到達",
      });
      setIsLoading(false);
      setPickup("");
      setDestination("");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Quick Call Button */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
        <CardContent className="p-6 text-center">
          <Car className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-xl font-bold mb-2">快速叫車</h2>
          <p className="opacity-90">一鍵呼叫，輕鬆出行</p>
        </CardContent>
      </Card>

      {/* Call Car Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-700">
            <MapPin className="h-5 w-5 mr-2" />
            行程資訊
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pickup" className="text-sm font-medium text-gray-700">
              上車地點
            </Label>
            <Input
              id="pickup"
              placeholder="請輸入上車地點"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="destination" className="text-sm font-medium text-gray-700">
              目的地
            </Label>
            <Input
              id="destination"
              placeholder="請輸入目的地"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleCallCar} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                叫車中...
              </div>
            ) : (
              "立即叫車"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Estimated Time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">預估到達時間</span>
            </div>
            <span className="font-medium text-emerald-600">5-8 分鐘</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallCar;
