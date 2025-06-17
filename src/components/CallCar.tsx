
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CallCar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCallCar = async () => {
    setIsLoading(true);
    
    // 模擬叫車過程
    setTimeout(() => {
      toast({
        title: "叫車成功！",
        description: "司機預計5分鐘後到達",
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
        <CardContent className="text-center">
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
