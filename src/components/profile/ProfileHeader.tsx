
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiffProfile } from "@/lib/liff";

interface ProfileHeaderProps {
  liffProfile: LiffProfile | null;
}

const ProfileHeader = ({ liffProfile }: ProfileHeaderProps) => {
  const displayName = liffProfile?.displayName || "用戶";
  const avatarUrl = liffProfile?.pictureUrl;

  return (
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
  );
};

export default ProfileHeader;
