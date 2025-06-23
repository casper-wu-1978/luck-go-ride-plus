import { supabase } from "@/integrations/supabase/client";
import type { CallRecord, OrderCompletionData } from "@/types/driverOrders";

export const driverOrderService = {
  async loadWaitingOrders(): Promise<CallRecord[]> {
    const { data, error } = await supabase
      .from('call_records')
      .select(`
        *,
        merchant:merchant_profiles!inner(
          business_name,
          contact_name,
          phone,
          business_address
        )
      `)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('載入待接訂單錯誤:', error);
      return [];
    }

    return (data || []).map(order => ({
      id: order.id,
      carType: order.car_type,
      carTypeLabel: order.car_type_label,
      status: order.status,
      timestamp: new Date(order.created_at),
      favoriteType: order.favorite_type,
      favoriteInfo: order.favorite_info || undefined,
      merchantInfo: order.merchant ? {
        businessName: order.merchant.business_name,
        contactName: order.merchant.contact_name,
        phone: order.merchant.phone,
        businessAddress: order.merchant.business_address
      } : undefined
    }));
  },

  async loadAcceptedOrders(driverId: string): Promise<CallRecord[]> {
    const { data, error } = await supabase
      .from('call_records')
      .select(`
        *,
        merchant:merchant_profiles!inner(
          business_name,
          contact_name,
          phone,
          business_address
        )
      `)
      .eq('driver_id', driverId)
      .in('status', ['matched', 'arrived', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('載入已接訂單錯誤:', error);
      return [];
    }

    return (data || []).map(order => ({
      id: order.id,
      carType: order.car_type,
      carTypeLabel: order.car_type_label,
      status: order.status,
      timestamp: new Date(order.created_at),
      favoriteType: order.favorite_type,
      favoriteInfo: order.favorite_info || undefined,
      merchantInfo: order.merchant ? {
        businessName: order.merchant.business_name,
        contactName: order.merchant.contact_name,
        phone: order.merchant.phone,
        businessAddress: order.merchant.business_address
      } : undefined
    }));
  },

  async acceptOrder(orderId: string, driverId: string) {
    const { error } = await supabase
      .from('call_records')
      .update({
        status: 'matched',
        driver_id: driverId,
        accepted_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('接單錯誤:', error);
      throw error;
    }
  },

  async arriveAtOrder(orderId: string, driverId: string) {
    // 先檢查訂單是否存在且屬於該司機
    const { data: orderCheck, error: checkError } = await supabase
      .from('call_records')
      .select('id, status, driver_id')
      .eq('id', orderId)
      .eq('driver_id', driverId)
      .eq('status', 'matched')
      .single();

    if (checkError) {
      console.error('檢查訂單錯誤:', checkError);
      throw new Error('找不到對應的訂單或訂單狀態不正確');
    }

    if (!orderCheck) {
      throw new Error('訂單不存在或您沒有權限操作此訂單');
    }

    // 更新訂單狀態為已抵達
    const { error: updateError } = await supabase
      .from('call_records')
      .update({
        status: 'arrived'
      })
      .eq('id', orderId)
      .eq('driver_id', driverId);

    if (updateError) {
      console.error('更新抵達狀態錯誤:', updateError);
      throw updateError;
    }
  },

  async completeOrder(orderId: string, driverId: string, completionData?: OrderCompletionData) {
    // 先獲取當前訂單狀態
    const { data: currentOrder, error: fetchError } = await supabase
      .from('call_records')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchError || !currentOrder) {
      console.error('獲取訂單狀態錯誤:', fetchError);
      throw new Error('無法獲取訂單狀態');
    }

    let newStatus = '';
    let updateData: any = {
      status: '',
      driver_id: driverId
    };

    // 根據當前狀態決定下一個狀態
    if (currentOrder.status === 'arrived') {
      newStatus = 'in_progress';
      updateData.status = newStatus;
    } else if (currentOrder.status === 'in_progress') {
      newStatus = 'completed';
      updateData.status = newStatus;
      updateData.completed_at = new Date().toISOString();
      
      // 加入完成訂單的額外資料
      if (completionData) {
        updateData.destination_address = completionData.destinationAddress;
        updateData.distance_km = completionData.distanceKm;
        updateData.fare_amount = completionData.fareAmount;
      }
    } else {
      throw new Error('訂單狀態不正確');
    }

    console.log('更新訂單狀態:', orderId, '從', currentOrder.status, '到', newStatus);
    console.log('更新資料:', updateData);
    
    const { error } = await supabase
      .from('call_records')
      .update(updateData)
      .eq('id', orderId)
      .eq('driver_id', driverId);

    if (error) {
      console.error('更新訂單狀態錯誤:', error);
      throw error;
    }

    return { newStatus, message: newStatus === 'completed' ? "感謝您的服務！" : "請安全駕駛" };
  },

  async cancelOrder(orderId: string, driverId: string) {
    const { error } = await supabase
      .from('call_records')
      .update({
        status: 'cancelled',
        driver_id: null,
        accepted_at: null
      })
      .eq('id', orderId)
      .eq('driver_id', driverId);

    if (error) {
      console.error('取消訂單錯誤:', error);
      throw error;
    }
  }
};
