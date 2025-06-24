
import { supabase } from "@/integrations/supabase/client";
import type { CallRecord, OrderCompletionData } from "@/types/driverOrders";

export const driverOrderService = {
  async loadDriverOrders(): Promise<CallRecord[]> {
    console.log('開始載入司機訂單...');
    const startTime = Date.now();
    
    const { data: orders, error } = await supabase
      .from('call_records')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('載入司機訂單錯誤:', error);
      return [];
    }

    const ordersWithData = (orders || []).map(order => ({
      id: order.id,
      carType: order.car_type,
      carTypeLabel: order.car_type_label,
      status: order.status as 'waiting' | 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
      timestamp: new Date(order.created_at),
      favoriteType: order.favorite_type,
      favoriteInfo: order.favorite_info || undefined,
      driverInfo: order.driver_name ? {
        name: order.driver_name,
        phone: order.driver_phone || '',
        plateNumber: order.driver_plate_number || '',
        carBrand: order.driver_car_brand || '',
        carColor: order.driver_car_color || ''
      } : undefined
    }));

    const loadTime = Date.now() - startTime;
    console.log(`司機訂單載入完成，耗時: ${loadTime}ms，共 ${ordersWithData.length} 筆`);
    
    return ordersWithData;
  },

  async loadAcceptedOrders(driverId: string): Promise<CallRecord[]> {
    console.log('載入已接訂單...', driverId);
    
    const { data: orders, error } = await supabase
      .from('call_records')
      .select('*')
      .eq('driver_id', driverId)
      .in('status', ['matched', 'arrived', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('載入已接訂單錯誤:', error);
      return [];
    }

    return (orders || []).map(order => ({
      id: order.id,
      carType: order.car_type,
      carTypeLabel: order.car_type_label,
      status: order.status as 'waiting' | 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
      timestamp: new Date(order.created_at),
      favoriteType: order.favorite_type,
      favoriteInfo: order.favorite_info || undefined,
      driverInfo: order.driver_name ? {
        name: order.driver_name,
        phone: order.driver_phone || '',
        plateNumber: order.driver_plate_number || '',
        carBrand: order.driver_car_brand || '',
        carColor: order.driver_car_color || ''
      } : undefined
    }));
  },

  async acceptOrder(orderId: string, driverId: string): Promise<void> {
    console.log('司機接單:', orderId, driverId);
    
    // 首先獲取司機的詳細資料
    const { data: driverProfile, error: driverError } = await supabase
      .from('driver_profiles')
      .select('name, phone, vehicle_brand, vehicle_color, plate_number')
      .eq('line_user_id', driverId)
      .single();

    if (driverError) {
      console.error('獲取司機資料錯誤:', driverError);
      throw new Error('無法獲取司機資料');
    }

    if (!driverProfile) {
      throw new Error('找不到司機資料，請先完善個人資料');
    }

    // 更新訂單狀態並加入司機資訊（包含車輛資訊）
    const { error } = await supabase
      .from('call_records')
      .update({
        status: 'matched',
        driver_id: driverId,
        driver_name: driverProfile.name,
        driver_phone: driverProfile.phone || '',
        driver_car_brand: driverProfile.vehicle_brand || '',
        driver_car_color: driverProfile.vehicle_color || '',
        driver_plate_number: driverProfile.plate_number || '',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('status', 'waiting');

    if (error) {
      console.error('接單錯誤:', error);
      throw new Error('接單失敗，請稍後再試');
    }

    console.log('接單成功，司機資料已更新:', {
      orderId,
      driverId,
      driverName: driverProfile.name,
      vehicleInfo: {
        brand: driverProfile.vehicle_brand,
        color: driverProfile.vehicle_color,
        plateNumber: driverProfile.plate_number
      }
    });
  },

  async updateOrderStatus(
    orderId: string, 
    status: 'arrived' | 'in_progress' | 'completed' | 'cancelled',
    completionData?: OrderCompletionData
  ): Promise<void> {
    console.log('更新訂單狀態:', orderId, status);
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed' && completionData) {
      updateData.destination_address = completionData.destinationAddress;
      updateData.distance_km = completionData.distanceKm;
      updateData.fare_amount = completionData.fareAmount;
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('call_records')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('更新訂單狀態錯誤:', error);
      throw new Error('更新訂單狀態失敗');
    }

    console.log('訂單狀態更新成功:', { orderId, status, completionData });
  }
};
