
import { supabase } from "@/integrations/supabase/client";

export interface OnlineDriver {
  line_user_id: string;
  name: string;
  phone: string;
  plate_number: string;
  car_brand: string;
  car_color: string;
  location?: string;
  last_active: string;
}

export const getOnlineDrivers = async (): Promise<OnlineDriver[]> => {
  try {
    // Get online drivers from driver_profiles joined with user_roles
    const { data, error } = await supabase
      .from('driver_profiles')
      .select(`
        line_user_id,
        name,
        phone,
        plate_number,
        vehicle_brand,
        vehicle_color,
        status,
        updated_at
      `)
      .eq('status', 'online')
      .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5分鐘內活躍

    if (error) {
      console.error('獲取線上司機錯誤:', error);
      return [];
    }

    return (data || []).map(driver => ({
      line_user_id: driver.line_user_id,
      name: driver.name,
      phone: driver.phone || '0900-000-000',
      plate_number: driver.plate_number || 'N/A',
      car_brand: driver.vehicle_brand || 'Unknown',
      car_color: driver.vehicle_color || 'Unknown',
      last_active: driver.updated_at
    }));
  } catch (error) {
    console.error('獲取線上司機錯誤:', error);
    return [];
  }
};

export const matchDriver = async (carType: string): Promise<OnlineDriver | null> => {
  const onlineDrivers = await getOnlineDrivers();
  
  if (onlineDrivers.length === 0) {
    return null;
  }

  // 簡單的媒合邏輯：隨機選擇一個線上司機
  // 實際應用中可以根據距離、評分等因素進行更智能的媒合
  const randomIndex = Math.floor(Math.random() * onlineDrivers.length);
  return onlineDrivers[randomIndex];
};

export const notifyDriver = async (driverId: string, orderInfo: any) => {
  try {
    // 發送通知給司機 (可以整合推播服務)
    console.log(`通知司機 ${driverId} 新的訂單:`, orderInfo);
    
    // 這裡可以整合 LINE 推播或其他通知服務
    // 暫時使用 console.log 代替
    
    return true;
  } catch (error) {
    console.error('通知司機錯誤:', error);
    return false;
  }
};
