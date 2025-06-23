
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, DollarSign, Locate } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderCompletionFormProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    orderId: string;
    destinationAddress: string;
    distanceKm: number;
    fareAmount: number;
  }) => void;
}

const OrderCompletionForm = ({ orderId, isOpen, onClose, onSubmit }: OrderCompletionFormProps) => {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [fareAmount, setFareAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadMapboxToken();
    }
  }, [isOpen]);

  const loadMapboxToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) {
        console.error('無法獲取 Mapbox token:', error);
        return;
      }
      setMapboxToken(data.token);
    } catch (error) {
      console.error('載入 Mapbox token 錯誤:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (!mapboxToken) {
      toast({
        title: "定位失敗",
        description: "Mapbox 服務尚未初始化",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        });
      });

      const { latitude, longitude } = position.coords;
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&language=zh-TW`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setDestinationAddress(data.features[0].place_name);
          toast({
            title: "定位成功",
            description: "已獲取當前位置地址",
          });
        } else {
          setDestinationAddress(`緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`);
          toast({
            title: "定位成功",
            description: "已獲取座標位置",
          });
        }
      } else {
        setDestinationAddress(`緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`);
        toast({
          title: "定位成功",
          description: "已獲取座標位置",
        });
      }
    } catch (error) {
      console.error('定位錯誤:', error);
      toast({
        title: "定位失敗",
        description: "請檢查定位權限設定或手動輸入地址",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destinationAddress.trim() || !distanceKm || !fareAmount) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        orderId,
        destinationAddress: destinationAddress.trim(),
        distanceKm: parseFloat(distanceKm),
        fareAmount: parseFloat(fareAmount)
      });
      
      // Reset form
      setDestinationAddress("");
      setDistanceKm("");
      setFareAmount("");
      onClose();
    } catch (error) {
      console.error('完成訂單表單提交錯誤:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDestinationAddress("");
      setDistanceKm("");
      setFareAmount("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-800">
            <Navigation className="h-5 w-5 mr-2" />
            完成訂單
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center text-sm font-medium">
              <MapPin className="h-4 w-4 mr-1" />
              目的地地址
            </Label>
            <div className="flex gap-2">
              <Textarea
                id="destination"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="請輸入目的地地址或點擊定位按鈕"
                required
                disabled={isSubmitting || isGettingLocation}
                className="min-h-[80px] flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isSubmitting || isGettingLocation || !mapboxToken}
                className="self-start mt-1"
              >
                <Locate className={`h-4 w-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              點擊定位按鈕自動獲取當前位置地址
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance" className="flex items-center text-sm font-medium">
                <Navigation className="h-4 w-4 mr-1" />
                行駛公里數
              </Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                min="0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="0.0"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fare" className="flex items-center text-sm font-medium">
                <DollarSign className="h-4 w-4 mr-1" />
                車資費用
              </Label>
              <Input
                id="fare"
                type="number"
                step="1"
                min="0"
                value={fareAmount}
                onChange={(e) => setFareAmount(e.target.value)}
                placeholder="0"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !destinationAddress.trim() || !distanceKm || !fareAmount}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "提交中..." : "完成訂單"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCompletionForm;
