
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Navigation } from "lucide-react";

interface DriverStatusCardProps {
  isOnline: boolean;
  currentLocation: string;
  isGettingLocation: boolean;
  onToggleOnline: (checked: boolean) => void;
  onGetCurrentLocation: () => void;
}

const DriverStatusCard = ({
  isOnline,
  currentLocation,
  isGettingLocation,
  onToggleOnline,
  onGetCurrentLocation
}: DriverStatusCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium">{isOnline ? '已上線' : '離線'}</span>
          </div>
          <Switch
            checked={isOnline}
            onCheckedChange={onToggleOnline}
            disabled={isGettingLocation}
          />
        </div>
        
        {isOnline && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">當前位置</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onGetCurrentLocation}
                disabled={isGettingLocation}
              >
                <Navigation className="h-4 w-4 mr-1" />
                {isGettingLocation ? '定位中...' : '重新定位'}
              </Button>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-800 break-words">
                {currentLocation || '獲取位置中...'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverStatusCard;
