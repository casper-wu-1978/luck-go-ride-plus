
import { supabase } from "@/integrations/supabase/client";
import { DriverProfile } from "@/types/profile";

export class DriverProfileService {
  static async loadProfile(lineUserId: string): Promise<DriverProfile | null> {
    console.log('Loading driver profile for LINE user:', lineUserId);
    
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (error) {
      console.error('載入司機個人資料錯誤:', error);
      throw new Error(`載入個人資料時發生錯誤: ${error.message}`);
    }

    console.log('Driver profile data from database:', data);

    if (data) {
      return {
        id: data.id,
        line_user_id: data.line_user_id || lineUserId,
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        vehicle_type: data.vehicle_type || "",
        vehicle_brand: data.vehicle_brand || "",
        vehicle_color: data.vehicle_color || "",
        plate_number: data.plate_number || "",
        license_number: data.license_number || "",
      };
    }

    return null;
  }

  static async saveProfile(lineUserId: string, profile: DriverProfile): Promise<DriverProfile> {
    console.log('Saving driver profile for LINE user:', lineUserId);
    console.log('Driver profile data to save:', profile);

    const profileData = {
      line_user_id: lineUserId,
      driver_id: lineUserId,
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      email: profile.email.trim(),
      vehicle_type: profile.vehicle_type?.trim(),
      vehicle_brand: profile.vehicle_brand?.trim(),
      vehicle_color: profile.vehicle_color?.trim(),
      plate_number: profile.plate_number?.trim(),
      license_number: profile.license_number?.trim(),
    };

    console.log('Formatted driver profile data:', profileData);

    // Check if profile exists
    const existingProfile = await this.checkExistingProfile(lineUserId);
    
    let result;
    if (existingProfile) {
      console.log('Updating existing driver profile');
      result = await supabase
        .from('driver_profiles')
        .update(profileData)
        .eq('line_user_id', lineUserId)
        .select()
        .single();
    } else {
      console.log('Inserting new driver profile');
      result = await supabase
        .from('driver_profiles')
        .insert(profileData)
        .select()
        .single();
    }

    console.log('Save driver profile result:', result);

    if (result.error) {
      console.error('儲存錯誤:', result.error);
      throw new Error(`儲存時發生錯誤: ${result.error.message || '未知錯誤'}`);
    }

    return {
      id: result.data.id,
      line_user_id: result.data.line_user_id || lineUserId,
      name: result.data.name || "",
      phone: result.data.phone || "",
      email: result.data.email || "",
      vehicle_type: result.data.vehicle_type || "",
      vehicle_brand: result.data.vehicle_brand || "",
      vehicle_color: result.data.vehicle_color || "",
      plate_number: result.data.plate_number || "",
      license_number: result.data.license_number || "",
    };
  }

  private static async checkExistingProfile(lineUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (error) {
      console.error('檢查現有資料錯誤:', error);
      throw error;
    }

    console.log('Existing driver data check:', data);
    return !!data;
  }
}
