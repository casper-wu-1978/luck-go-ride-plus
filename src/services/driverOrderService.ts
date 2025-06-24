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

    // 載入商家資訊
    const ordersWithMerchantInfo = await Promise.all(
      (orders || []).map(async (order) => {
        let merchantInfo = undefined;
        
        // 根據 line_user_id 載入商家資訊
        if (order.line_user_id) {
          const { data: merchantData } = await supabase
            .from('merchant_profiles')
            .select('business_name, contact_name, phone, business_address')
            .eq('line_user_id', order.line_user_id)
            .single();
          
          if (merchantData) {
            merchantInfo = {
              businessName: merchantData.business_name,
              contactName: merchantData.contact_name,
              phone: merchantData.phone,
              businessAddress: merchantData.business_address
            };
          }
        }

        return {
          id: order.id,
          carType: order.car_type,
          carTypeLabel: order.car_type_label,
          status: order.status as 'waiting' | 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
          timestamp: new Date(order.created_at),
          favoriteType: order.favorite_type,
          favoriteInfo: order.favorite_info || undefined,
          merchantInfo,
          driverInfo: order.driver_name ? {
            name: order.driver_name,
            phone: order.driver_phone || '',
            plateNumber: order.driver_plate_number || '',
            carBrand: order.driver_car_brand || '',
            carColor: order.driver_car_color || ''
          } : undefined
        };
      })
    );

    const loadTime = Date.now() - startTime;
    console.log(`司機訂單載入完成，耗時: ${loadTime}ms，共 ${ordersWithMerchantInfo.length} 筆`);
    
    return ordersWithMerchantInfo;
  },

  async loadWaitingOrders(): Promise<CallRecord[]> {
    console.log('開始載入待接訂單...');
    return this.loadDriverOrders();
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

    // 載入商家資訊
    const ordersWithMerchantInfo = await Promise.all(
      (orders || []).map(async (order) => {
        let merchantInfo = undefined;
        
        // 根據 line_user_id 載入商家資訊
        if (order.line_user_id) {
          const { data: merchantData } = await supabase
            .from('merchant_profiles')
            .select('business_name, contact_name, phone, business_address')
            .eq('line_user_id', order.line_user_id)
            .single();
          
          if (merchantData) {
            merchantInfo = {
              businessName: merchantData.business_name,
              contactName: merchantData.contact_name,
              phone: merchantData.phone,
              businessAddress: merchantData.business_address
            };
          }
        }

        return {
          id: order.id,
          carType: order.car_type,
          carTypeLabel: order.car_type_label,
          status: order.status as 'waiting' | 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
          timestamp: new Date(order.created_at),
          favoriteType: order.favorite_type,
          favoriteInfo: order.favorite_info || undefined,
          merchantInfo,
          driverInfo: order.driver_name ? {
            name: order.driver_name,
            phone: order.driver_phone || '',
            plateNumber: order.driver_plate_number || '',
            carBrand: order.driver_car_brand || '',
            carColor: order.driver_car_color || ''
          } : undefined
        };
      })
    );

    return ordersWithMerchantInfo;
  },

  async acceptOrder(orderId: string, driverId: string): Promise<void> {
    console.log('司機接單 - 開始:', { orderId, driverId });
    
    try {
      // 首先獲取司機的詳細資料，使用更明確的查詢
      console.log('正在獲取司機資料...', driverId);
      const { data: driverProfile, error: driverError } = await supabase
        .from('driver_profiles')
        .select(`
          name, 
          phone, 
          vehicle_brand, 
          vehicle_color, 
          plate_number,
          vehicle_type,
          email
        `)
        .eq('line_user_id', driverId)
        .single();

      console.log('司機資料查詢結果:', { 
        driverProfile, 
        driverError,
        查詢條件: { line_user_id: driverId }
      });

      if (driverError) {
        console.error('獲取司機資料錯誤:', driverError);
        throw new Error(`無法獲取司機資料: ${driverError.message}`);
      }

      if (!driverProfile) {
        console.error('司機資料不存在:', driverId);
        throw new Error('找不到司機資料，請先完善個人資料');
      }

      // 檢查司機資料的完整性
      console.log('檢查司機資料完整性:', {
        姓名: driverProfile.name,
        電話: driverProfile.phone,
        車輛品牌: driverProfile.vehicle_brand,
        車輛顏色: driverProfile.vehicle_color,
        車牌號碼: driverProfile.plate_number
      });

      // 準備更新的資料，確保欄位對應正確，並處理空值
      const updateData = {
        status: 'matched' as const,
        driver_id: driverId,
        driver_name: driverProfile.name || '未填寫',
        driver_phone: driverProfile.phone || '未填寫',
        driver_car_brand: driverProfile.vehicle_brand || '未填寫',
        driver_car_color: driverProfile.vehicle_color || '未填寫',
        driver_plate_number: driverProfile.plate_number || '未填寫',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('準備更新訂單資料:', {
        orderId,
        updateData
      });

      // 更新訂單狀態並加入司機完整資訊
      const { data: updateResult, error: updateError } = await supabase
        .from('call_records')
        .update(updateData)
        .eq('id', orderId)
        .eq('status', 'waiting')
        .select('*');

      console.log('訂單更新結果:', { updateResult, updateError });

      if (updateError) {
        console.error('接單錯誤:', updateError);
        throw new Error(`接單失敗: ${updateError.message}`);
      }

      if (!updateResult || updateResult.length === 0) {
        console.error('訂單更新失敗 - 可能訂單已被其他司機接走或狀態不正確');
        throw new Error('接單失敗，訂單可能已被其他司機接走');
      }

      // 驗證更新結果
      const updatedRecord = updateResult[0];
      console.log('接單成功，最終資料驗證:', {
        orderId,
        driverId,
        司機姓名: updatedRecord.driver_name,
        司機電話: updatedRecord.driver_phone,
        車輛品牌: updatedRecord.driver_car_brand,
        車輛顏色: updatedRecord.driver_car_color,
        車牌號碼: updatedRecord.driver_plate_number,
        完整記錄: updatedRecord
      });

      // 最後再次確認資料庫中的資料
      const { data: verifyData } = await supabase
        .from('call_records')
        .select('driver_name, driver_phone, driver_car_brand, driver_car_color, driver_plate_number')
        .eq('id', orderId)
        .single();
      
      console.log('資料庫驗證查詢結果:', verifyData);

    } catch (error) {
      console.error('接單過程發生錯誤:', error);
      throw error;
    }
  },

  async arriveAtOrder(orderId: string, driverId: string): Promise<void> {
    console.log('司機抵達訂單:', orderId, driverId);
    
    const { error } = await supabase
      .from('call_records')
      .update({
        status: 'arrived',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('driver_id', driverId);

    if (error) {
      console.error('抵達操作錯誤:', error);
      throw new Error('無法完成抵達操作');
    }

    console.log('司機抵達狀態更新成功:', { orderId, driverId });
  },

  async completeOrder(orderId: string, driverId: string, completionData?: OrderCompletionData): Promise<{ newStatus: string; message: string }> {
    console.log('完成訂單:', orderId, driverId, completionData);
    
    // 獲取當前訂單狀態
    const { data: currentOrder, error: fetchError } = await supabase
      .from('call_records')
      .select('status')
      .eq('id', orderId)
      .eq('driver_id', driverId)
      .single();

    if (fetchError || !currentOrder) {
      console.error('獲取訂單狀態錯誤:', fetchError);
      throw new Error('無法獲取訂單狀態');
    }

    let newStatus: string;
    let message: string;

    if (currentOrder.status === 'arrived') {
      // 從已抵達到開始行程
      newStatus = 'in_progress';
      message = '行程已開始';
    } else if (currentOrder.status === 'in_progress') {
      // 從行程中到完成
      newStatus = 'completed';
      message = '訂單已完成';
    } else {
      throw new Error('訂單狀態不正確，無法完成操作');
    }

    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (newStatus === 'completed' && completionData) {
      updateData.destination_address = completionData.destinationAddress;
      updateData.distance_km = completionData.distanceKm;
      updateData.fare_amount = completionData.fareAmount;
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('call_records')
      .update(updateData)
      .eq('id', orderId)
      .eq('driver_id', driverId);

    if (error) {
      console.error('完成訂單錯誤:', error);
      throw new Error('無法完成訂單操作');
    }

    console.log('訂單狀態更新成功:', { orderId, newStatus, completionData });
    return { newStatus, message };
  },

  async cancelOrder(orderId: string, driverId: string): Promise<void> {
    console.log('取消訂單:', orderId, driverId);
    
    // 將訂單狀態改回 waiting，並清除司機資訊
    const { error } = await supabase
      .from('call_records')
      .update({
        status: 'waiting',
        driver_id: null,
        driver_name: null,
        driver_phone: null,
        driver_car_brand: null,
        driver_car_color: null,
        driver_plate_number: null,
        accepted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('driver_id', driverId);

    if (error) {
      console.error('取消訂單錯誤:', error);
      throw new Error('無法取消訂單');
    }

    console.log('訂單已取消並重新開放:', { orderId, driverId });
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
