
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Edit, Car, FileText } from "lucide-react";
import { DriverProfile } from "@/types/profile";

interface DriverProfileFormProps {
  profile: DriverProfile;
  editProfile: DriverProfile;
  setEditProfile: (profile: DriverProfile) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isLoading: boolean;
  onSaveProfile: () => Promise<boolean>;
  onCancelEdit: () => void;
}

const DriverProfileForm = ({
  profile,
  editProfile,
  setEditProfile,
  isEditing,
  setIsEditing,
  isLoading,
  onSaveProfile,
  onCancelEdit,
}: DriverProfileFormProps) => {
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
    <div className="space-y-4">
      {/* 基本資料 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-blue-700">
              <User className="h-5 w-5 mr-2" />
              基本資料
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
                <Label htmlFor="licenseNumber">駕駛執照號碼</Label>
                <Input
                  id="licenseNumber"
                  value={editProfile.license_number || ""}
                  onChange={(e) => setEditProfile({...editProfile, license_number: e.target.value})}
                  placeholder="請輸入駕駛執照號碼"
                />
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
                <FileText className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">駕駛執照號碼</p>
                  <p className="font-medium">{profile.license_number || "未設定"}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 車輛資料 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700">
            <Car className="h-5 w-5 mr-2" />
            車輛資料
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="vehicleType">車輛類型</Label>
                <Input
                  id="vehicleType"
                  value={editProfile.vehicle_type || ""}
                  onChange={(e) => setEditProfile({...editProfile, vehicle_type: e.target.value})}
                  placeholder="例如：轎車、休旅車"
                />
              </div>

              <div>
                <Label htmlFor="vehicleBrand">車輛品牌</Label>
                <Input
                  id="vehicleBrand"
                  value={editProfile.vehicle_brand || ""}
                  onChange={(e) => setEditProfile({...editProfile, vehicle_brand: e.target.value})}
                  placeholder="例如：Toyota、Honda"
                />
              </div>

              <div>
                <Label htmlFor="vehicleColor">車輛顏色</Label>
                <Input
                  id="vehicleColor"
                  value={editProfile.vehicle_color || ""}
                  onChange={(e) => setEditProfile({...editProfile, vehicle_color: e.target.value})}
                  placeholder="例如：白色、黑色"
                />
              </div>

              <div>
                <Label htmlFor="plateNumber">車牌號碼</Label>
                <Input
                  id="plateNumber"
                  value={editProfile.plate_number || ""}
                  onChange={(e) => setEditProfile({...editProfile, plate_number: e.target.value})}
                  placeholder="例如：ABC-1234"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={handleSave} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                <Car className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">車輛類型</p>
                  <p className="font-medium">{profile.vehicle_type || "未設定"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">車輛品牌</p>
                  <p className="font-medium">{profile.vehicle_brand || "未設定"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">車輛顏色</p>
                  <p className="font-medium">{profile.vehicle_color || "未設定"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">車牌號碼</p>
                  <p className="font-medium">{profile.plate_number || "未設定"}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverProfileForm;
