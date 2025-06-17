
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { User, Phone, Mail, Bell, Shield, LogOut, Edit, Building, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { closeLiff } from "@/lib/liff";

const Profile = () => {
  const { profile: liffProfile, isLoading } = useLiff();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phone: "0912-345-678",
    email: "user@example.com",
    businessName: "商家名稱",
    businessAddress: "台北市大安區忠孝東路四段123號",
  });
  const [editProfile, setEditProfile] = useState(profile);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  // 使用 LIFF 資料更新本地資料
  React.useEffect(() => {
    if (liffProfile) {
      setProfile(prev => ({
        ...prev,
        name: liffProfile.displayName,
      }));
      setEditProfile(prev => ({
        ...prev,
        name: liffProfile.displayName,
      }));
    }
  }, [liffProfile]);

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditing(false);
    toast({
      title: "更新成功",
      description: "個人資料已更新",
    });
  };

  const handleCancelEdit = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    closeLiff();
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

  const displayName = liffProfile?.displayName || profile.name || "用戶";
  const avatarUrl = liffProfile?.pictureUrl;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
        <CardContent className="p-6 text-center">
          <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-white/20">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold mb-1">{displayName}</h2>
          <p className="opacity-90">LINE 用戶</p>
          {liffProfile?.userId && (
            <p className="text-sm opacity-75 mt-1">ID: {liffProfile.userId.slice(-8)}</p>
          )}
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-emerald-700">
              <User className="h-5 w-5 mr-2" />
              個人資料
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="name">姓名 (來自 LINE)</Label>
                <Input
                  id="name"
                  value={displayName}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">此資料來自 LINE，無法修改</p>
              </div>
              
              <div>
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  value={editProfile.phone}
                  onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  value={editProfile.email}
                  onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="businessName">商家名稱</Label>
                <Input
                  id="businessName"
                  value={editProfile.businessName}
                  onChange={(e) => setEditProfile({...editProfile, businessName: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="businessAddress">商家住址</Label>
                <Input
                  id="businessAddress"
                  value={editProfile.businessAddress}
                  onChange={(e) => setEditProfile({...editProfile, businessAddress: e.target.value})}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button onClick={handleSaveProfile} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  儲存
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                  取消
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">姓名 (來自 LINE)</p>
                  <p className="font-medium">{displayName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">電話</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">電子郵件</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Building className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">商家名稱</p>
                  <p className="font-medium">{profile.businessName}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">商家住址</p>
                  <p className="font-medium">{profile.businessAddress}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-emerald-700">
            <Shield className="h-5 w-5 mr-2" />
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

      {/* Close LIFF */}
      <Button 
        variant="outline" 
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        關閉應用
      </Button>
    </div>
  );
};

export default Profile;
