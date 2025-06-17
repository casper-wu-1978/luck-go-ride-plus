
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

interface ProfileSettingsProps {
  notifications: boolean;
  setNotifications: (notifications: boolean) => void;
}

const ProfileSettings = ({ notifications, setNotifications }: ProfileSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-emerald-700">
          <Bell className="h-5 w-5 mr-2" />
          設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-4 w-4 text-gray-500 mr-3" />
            <div>
              <p className="font-medium">推播通知</p>
              <p className="text-sm text-gray-500">接收訂單和優惠通知</p>
            </div>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
