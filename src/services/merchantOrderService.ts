
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

    console.log('原始訂單資料:', orders);

    // 獲取商家資料
    const { data: merchantData } = await supabase
      .from('merchant_profiles')
      .select('business_name, contact_name, phone, business_address')
      .eq('line_user_id', merchantLineUserId)
      .single();

    // 組合訂單和司機資料 - 直接使用 call_records 表中的司機資料
    const ordersWithData = orders.map(order => {
      console.log('處理訂單:', order.id, '司機資料:', {
        driver_name: order.driver_name,
        driver_phone: order.driver_phone,
        driver_plate_number: order.driver_plate_number,
        driver_car_brand: order.driver_car_brand,
        driver_car_color: order.driver_car_color
      });

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
        driverInfo: order.driver_name ? {
          name: order.driver_name,
          phone: order.driver_phone || '',
          plateNumber: order.driver_plate_number || '',
          carBrand: order.driver_car_brand || '',
          carColor: order.driver_car_color || ''
        } : undefined
      };
    });

    console.log('處理後的訂單資料:', ordersWithData);

    const loadTime = Date.now() - startTime;
    console.log(`商家訂單載入完成，耗時: ${loadTime}ms，共 ${ordersWithData.length} 筆`);
    
    return ordersWithData;
  }
};
