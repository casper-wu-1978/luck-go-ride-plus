
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { User, Phone, Mail, Bell, Edit, Building, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
import { closeLiff } from "@/lib/liff";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  email: string;
  business_name: string;
  business_address: string;
}

const Profile = () => {
  const { profile: liffProfile, isLoading: liffLoading } = useLiff();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    phone: "",
    email: "",
    business_name: "",
    business_address: "",
  });
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);
  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 從資料庫載入個人資料
  const loadProfile = async () => {
    if (!liffProfile?.userId) {
      console.error('LIFF profile or userId not available');
      return;
    }

    try {
      console.log('Loading profile for user:', liffProfile.userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', liffProfile.userId)
        .maybeSingle();

      if (error) {
        console.error('載入個人資料錯誤:', error);
        toast({
          title: "載入失敗",
          description: `載入個人資料時發生錯誤: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Profile data from database:', data);

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          name: data.name || liffProfile.displayName,
          phone: data.phone || "",
          email: data.email || "",
          business_name: data.business_name || "",
          business_address: data.business_address || "",
        };
        setProfile(userProfile);
        setEditProfile(userProfile);
      } else {
        // 如果資料庫中沒有資料，使用 LIFF 資料初始化
        const userProfile: UserProfile = {
          name: liffProfile.displayName,
          phone: "",
          email: "",
          business_name: "",
          business_address: "",
        };
        setProfile(userProfile);
        setEditProfile(userProfile);
      }
    } catch (error) {
      console.error('載入個人資料錯誤:', error);
      toast({
        title: "載入失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      });
    }
  };

  // 使用 LIFF 資料初始化個人資料
  useEffect(() => {
    if (liffProfile && !liffLoading) {
      loadProfile();
    }
  }, [liffProfile, liffLoading]);

  const handleSaveProfile = async () => {
    if (!liffProfile?.userId) {
      toast({
        title: "儲存失敗",
        description: "無法取得用戶ID",
        variant: "destructive",
      });
      return;
    }

    if (!editProfile.name.trim()) {
      toast({
        title: "儲存失敗",
        description: "姓名不能為空",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving profile for user:', liffProfile.userId);
      console.log('Profile data to save:', editProfile);

      const profileData = {
        user_id: liffProfile.userId,
        name: editProfile.name.trim(),
        phone: editProfile.phone.trim(),
        email: editProfile.email.trim(),
        business_name: editProfile.business_name.trim(),
        business_address: editProfile.business_address.trim(),
      };

      console.log('Formatted profile data:', profileData);

      // 檢查是否已有資料，決定是新增還是更新
      const { data: existingData, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', liffProfile.userId)
        .maybeSingle();

      if (checkError) {
        console.error('檢查現有資料錯誤:', checkError);
        throw checkError;
      }

      console.log('Existing data check:', existingData);

      let result;
      if (existingData) {
        // 更新現有資料
        console.log('Updating existing profile');
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', liffProfile.userId)
          .select()
          .single();
      } else {
        // 新增資料
        console.log('Inserting new profile');
        result = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
      }

      console.log('Save result:', result);

      if (result.error) {
        console.error('儲存錯誤:', result.error);
        throw result.error;
      }

      const updatedProfile: UserProfile = {
        id: result.data.id,
        name: result.data.name,
        phone: result.data.phone || "",
        email: result.data.email || "",
        business_name: result.data.business_name || "",
        business_address: result.data.business_address || "",
      };
      
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: "更新成功",
        description: "個人資料已儲存至資料庫",
      });
    } catch (error: any) {
      console.error('儲存錯誤:', error);
      toast({
        title: "儲存失敗",
        description: `儲存時發生錯誤: ${error.message || '未知錯誤'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  const handleExit = () => {
    closeLiff();
  };

  if (liffLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  const displayName = liffProfile?.displayName || "用戶";
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
          <p className="opacity-90">Luck Go 用戶</p>
          {liffProfile?.userId && (
            <p className="text-sm opacity-75 mt-1">LINE ID: {liffProfile.userId.slice(-8)}</p>
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
              disabled={isLoading}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                  placeholder="請輸入姓名"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  value={editProfile.phone}
                  onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                  placeholder="請輸入電話號碼"
                />
              </div>
              
              <div>
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  value={editProfile.email}
                  onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                  placeholder="請輸入電子郵件"
                />
              </div>

              <div>
                <Label htmlFor="businessName">商家名稱</Label>
                <Input
                  id="businessName"
                  value={editProfile.business_name}
                  onChange={(e) => setEditProfile({...editProfile, business_name: e.target.value})}
                  placeholder="請輸入商家名稱"
                />
              </div>

              <div>
                <Label htmlFor="businessAddress">商家住址</Label>
                <Input
                  id="businessAddress"
                  value={editProfile.business_address}
                  onChange={(e) => setEditProfile({...editProfile, business_address: e.target.value})}
                  placeholder="請輸入商家住址"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={handleSaveProfile} 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? "儲存中..." : "儲存"}
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
                  <p className="text-sm text-gray-500">姓名</p>
                  <p className="font-medium">{profile.name || "未設定"}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">電話</p>
                  <p className="font-medium">{profile.phone || "未設定"}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">電子郵件</p>
                  <p className="font-medium">{profile.email || "未設定"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Building className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">商家名稱</p>
                  <p className="font-medium">{profile.business_name || "未設定"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">商家住址</p>
                  <p className="font-medium">{profile.business_address || "未設定"}</p>
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

      {/* Exit */}
      <Button 
        variant="outline" 
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleExit}
      >
        關閉應用程式
      </Button>
    </div>
  );
};

export default Profile;
