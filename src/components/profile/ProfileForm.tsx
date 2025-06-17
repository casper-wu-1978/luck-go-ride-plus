
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Edit, Building, MapPin } from "lucide-react";
import { UserProfile } from "@/types/profile";

interface ProfileFormProps {
  profile: UserProfile;
  editProfile: UserProfile;
  setEditProfile: (profile: UserProfile) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isLoading: boolean;
  onSaveProfile: () => Promise<boolean>;
  onCancelEdit: () => void;
}

const ProfileForm = ({
  profile,
  editProfile,
  setEditProfile,
  isEditing,
  setIsEditing,
  isLoading,
  onSaveProfile,
  onCancelEdit,
}: ProfileFormProps) => {
  const handleSave = async () => {
    const success = await onSaveProfile();
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    onCancelEdit();
    setIsEditing(false);
  };

  return (
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
                onClick={handleSave} 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? "儲存中..." : "儲存"}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
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
  );
};

export default ProfileForm;
