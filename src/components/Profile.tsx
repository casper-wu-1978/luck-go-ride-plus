
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { User, Phone, Mail, Bell, Shield, LogOut, Edit, Building, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLiff } from "@/contexts/LiffContext";
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
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // 檢查用戶登入狀態
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // 立即檢查當前會話
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  // 載入用戶資料
  useEffect(() => {
    if (user && !liffLoading) {
      loadUserProfile();
    }
  }, [user, liffLoading]);

  // 使用 LIFF 資料更新本地資料
  useEffect(() => {
    if (liffProfile && profile.name === "") {
      const updatedProfile = {
        ...profile,
        name: liffProfile.displayName,
      };
      setProfile(updatedProfile);
      setEditProfile(updatedProfile);
    }
  }, [liffProfile, profile]);

  const loadUserProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('載入資料錯誤:', error);
        toast({
          title: "載入失敗",
          description: "無法載入個人資料",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const userProfile = {
          id: data.id,
          name: data.name || (liffProfile?.displayName || ""),
          phone: data.phone || "",
          email: data.email || "",
          business_name: data.business_name || "",
          business_address: data.business_address || "",
        };
        setProfile(userProfile);
        setEditProfile(userProfile);
      } else if (liffProfile) {
        // 如果沒有資料但有 LIFF 資料，使用 LIFF 資料
        const newProfile = {
          name: liffProfile.displayName,
          phone: "",
          email: "",
          business_name: "",
          business_address: "",
        };
        setProfile(newProfile);
        setEditProfile(newProfile);
      }
    } catch (error) {
      console.error('載入資料錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast({
        title: "請先登入",
        description: "需要登入才能儲存資料",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        name: editProfile.name,
        phone: editProfile.phone,
        email: editProfile.email,
        business_name: editProfile.business_name,
        business_address: editProfile.business_address,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('儲存錯誤:', error);
        toast({
          title: "儲存失敗",
          description: "無法儲存個人資料",
          variant: "destructive",
        });
        return;
      }

      setProfile({
        id: data.id,
        name: data.name,
        phone: data.phone || "",
        email: data.email || "",
        business_name: data.business_name || "",
        business_address: data.business_address || "",
      });
      setIsEditing(false);
      toast({
        title: "更新成功",
        description: "個人資料已更新",
      });
    } catch (error) {
      console.error('儲存錯誤:', error);
      toast({
        title: "儲存失敗",
        description: "發生未知錯誤",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "登出成功",
        description: "已安全登出",
      });
    } catch (error) {
      console.error('登出錯誤:', error);
      toast({
        title: "登出失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
    }
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

  const displayName = profile.name || liffProfile?.displayName || user?.email || "用戶";
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
          {user?.id && (
            <p className="text-sm opacity-75 mt-1">ID: {user.id.slice(-8)}</p>
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
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                />
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
                  value={editProfile.business_name}
                  onChange={(e) => setEditProfile({...editProfile, business_name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="businessAddress">商家住址</Label>
                <Input
                  id="businessAddress"
                  value={editProfile.business_address}
                  onChange={(e) => setEditProfile({...editProfile, business_address: e.target.value})}
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
                  <p className="font-medium">{profile.email || user?.email || "未設定"}</p>
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

      {/* Logout */}
      <Button 
        variant="outline" 
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        登出
      </Button>
    </div>
  );
};

export default Profile;
