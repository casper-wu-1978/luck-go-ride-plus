
import { supabase } from "@/integrations/supabase/client";
import type { CallRecord } from "@/types/driverOrders";

export const merchantOrderService = {
  async loadMerchantOrders(merchantLineUserId: string): Promise<CallRecord[]> {
    console.log('開始載入商家訂單...', merchantLineUserId);
    const startTime = Date.now();
    
    // 獲取商家的所有訂單
    const { data: orders, error } = await supabase
      .from('call_records')
      .select('*')
      .eq('line_user_id', merchantLineUserId)
      .in('status', ['matched', 'arrived', 'in_progress', 'completed', 'cancelled'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('載入商家訂單錯誤:', error);
      return [];
    }

    if (!orders || orders.length === 0) {
      console.log('無商家訂單');
      return [];
    }

    // 獲取所有有司機的訂單的司機資料
    const driverIds = [...new Set(orders.filter(order => order.driver_id).map(order => order.driver_id))];
    let driverMap = new Map();
    
    if (driverIds.length > 0) {
      const { data: driversData } = await supabase
        .from('driver_profiles')
        .select('driver_id, name, phone, plate_number, vehicle_brand, vehicle_color')
        .in('driver_id', driverIds);

      driversData?.forEach(driver => {
        driverMap.set(driver.driver_id, driver);
      });
    }

    // 獲取商家資料
    const { data: merchantData } = await supabase
      .from('merchant_profiles')
      .select('business_name, contact_name, phone, business_address')
      .eq('line_user_id', merchantLineUserId)
      .single();

    // 組合訂單和司機資料
    const ordersWithData = orders.map(order => {
      const driverData = order.driver_id ? driverMap.get(order.driver_id) : null;
      
      return {
        id: order.id,
        carType: order.car_type,
        carTypeLabel: order.car_type_label,
        status: order.status,
        timestamp: new Date(order.created_at),
        favoriteType: order.favorite_type,
        favoriteInfo: order.favorite_info || undefined,
        merchantInfo: merchantData ? {
          businessName: merchantData.business_name,
          contactName: merchantData.contact_name,
          phone: merchantData.phone,
          businessAddress: merchantData.business_address
        } : undefined,
        driverInfo: driverData ? {
          name: driverData.name,
          phone: driverData.phone || '',
          plateNumber: driverData.plate_number || '',
          carBrand: driverData.vehicle_brand || '',
          carColor: driverData.vehicle_color || ''
        } : undefined
      };
    });

    const loadTime = Date.now() - startTime;
    console.log(`商家訂單載入完成，耗時: ${loadTime}ms，共 ${ordersWithData.length} 筆`);
    
    return ordersWithData;
  }
};
