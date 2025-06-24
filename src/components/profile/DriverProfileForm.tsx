
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLiff } from "@/contexts/LiffContext";
import VehicleTypeSelect from "@/components/driver/VehicleTypeSelect";
import type { DriverProfile } from "@/types/profile";

interface DriverProfileFormProps {
  profile: DriverProfile | null;
  onProfileUpdate: () => void;
}

const DriverProfileForm = ({ profile, onProfileUpdate }: DriverProfileFormProps) => {
  const { toast } = useToast();
  const { profile: liffProfile } = useLiff();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle_type: "",
    vehicle_brand: "",
    vehicle_color: "",
    plate_number: "",
    license_number: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        vehicle_type: profile.vehicle_type || "",
        vehicle_brand: profile.vehicle_brand || "",
        vehicle_color: profile.vehicle_color || "",
        plate_number: profile.plate_number || "",
        license_number: profile.license_number || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liffProfile?.userId) return;

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        vehicle_type: formData.vehicle_type,
        vehicle_brand: formData.vehicle_brand,
        vehicle_color: formData.vehicle_color,
        plate_number: formData.plate_number,
        license_number: formData.license_number,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('driver_profiles')
        .upsert({
          driver_id: liffProfile.userId,
          line_user_id: liffProfile.userId,
          ...updateData,
        });

      if (error) throw error;

      toast({
        title: "資料已更新",
        description: "司機資料已成功儲存",
      });
      
      onProfileUpdate();
    } catch (error) {
      console.error('更新司機資料錯誤:', error);
      toast({
        title: "更新失敗",
        description: "無法更新司機資料，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>司機資料</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">電話</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <VehicleTypeSelect
            value={formData.vehicle_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_type: value }))}
          />

          <div>
            <Label htmlFor="vehicleBrand">車輛廠牌</Label>
            <Input
              id="vehicleBrand"
              value={formData.vehicle_brand}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicle_brand: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="vehicleColor">車輛顏色</Label>
            <Input
              id="vehicleColor"
              value={formData.vehicle_color}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicle_color: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="plateNumber">車牌號碼</Label>
            <Input
              id="plateNumber"
              value={formData.plate_number}
              onChange={(e) => setFormData(prev => ({ ...prev, plate_number: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="licenseNumber">駕照號碼</Label>
            <Input
              id="licenseNumber"
              value={formData.license_number}
              onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "儲存中..." : "儲存資料"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverProfileForm;
