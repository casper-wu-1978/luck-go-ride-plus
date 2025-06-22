
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/profile";

export class ProfileService {
  static async loadProfile(lineUserId: string): Promise<UserProfile | null> {
    console.log('Loading profile for LINE user:', lineUserId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (error) {
      console.error('載入個人資料錯誤:', error);
      throw new Error(`載入個人資料時發生錯誤: ${error.message}`);
    }

    console.log('Profile data from database:', data);

    if (data) {
      return {
        id: data.id,
        line_user_id: data.line_user_id || lineUserId,
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        business_name: data.business_name || "",
        business_address: data.business_address || "",
      };
    }

    return null;
  }

  static async saveProfile(lineUserId: string, profile: UserProfile): Promise<UserProfile> {
    console.log('Saving profile for LINE user:', lineUserId);
    console.log('Profile data to save:', profile);

    const profileData = {
      line_user_id: lineUserId,
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      email: profile.email.trim(),
      business_name: profile.business_name.trim(),
      business_address: profile.business_address.trim(),
      user_id: null,
    };

    console.log('Formatted profile data:', profileData);

    // Check if profile exists
    const existingProfile = await this.checkExistingProfile(lineUserId);
    
    let result;
    if (existingProfile) {
      console.log('Updating existing profile');
      result = await supabase
        .from('profiles')
        .update(profileData)
        .eq('line_user_id', lineUserId)
        .select()
        .single();
    } else {
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
      throw new Error(`儲存時發生錯誤: ${result.error.message || '未知錯誤'}`);
    }

    return {
      id: result.data.id,
      line_user_id: result.data.line_user_id || lineUserId,
      name: result.data.name || "",
      phone: result.data.phone || "",
      email: result.data.email || "",
      business_name: result.data.business_name || "",
      business_address: result.data.business_address || "",
    };
  }

  private static async checkExistingProfile(lineUserId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (error) {
      console.error('檢查現有資料錯誤:', error);
      throw error;
    }

    console.log('Existing data check:', data);
    return !!data;
  }
}
