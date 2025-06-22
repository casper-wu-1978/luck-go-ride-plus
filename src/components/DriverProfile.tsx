
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiff } from "@/contexts/LiffContext";
import { closeLiff } from "@/lib/liff";
import { useDriverProfile } from "@/hooks/useDriverProfile";
import ProfileHeader from "@/components/profile/ProfileHeader";
import DriverProfileForm from "@/components/profile/DriverProfileForm";
import ProfileSettings from "@/components/profile/ProfileSettings";

const DriverProfile = () => {
  const { profile: liffProfile, isLoading: liffLoading } = useLiff();
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  const {
    profile,
    editProfile,
    setEditProfile,
    isLoading,
    handleSaveProfile,
    handleCancelEdit,
  } = useDriverProfile();

  const handleExit = () => {
    closeLiff();
  };

  if (liffLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader liffProfile={liffProfile} />

      <DriverProfileForm
        profile={profile}
        editProfile={editProfile}
        setEditProfile={setEditProfile}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isLoading={isLoading}
        onSaveProfile={handleSaveProfile}
        onCancelEdit={handleCancelEdit}
      />

      <ProfileSettings
        notifications={notifications}
        setNotifications={setNotifications}
      />

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

export default DriverProfile;
