import { supabase } from "@/integrations/supabase/client";
import { CallRecord, FavoriteCode, FavoriteAddress } from "@/types/callCar";

export const loadFavorites = async (lineUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorite_addresses')
      .select('*')
      .eq('line_user_id', lineUserId);

    if (error) {
      console.error('載入常用資料錯誤:', error);
      return { codes: [], addresses: [] };
    }

    const codes: FavoriteCode[] = [];
    const addresses: FavoriteAddress[] = [];

    data?.forEach(item => {
      if (item.address_type === 'code' && item.code) {
        codes.push({ id: item.code, label: item.code });
      } else if (item.address_type === 'address' && item.address) {
        addresses.push({ id: parseInt(item.id), name: item.name, address: item.address });
      }
    });

    return { codes, addresses };
  } catch (error) {
    console.error('載入常用資料錯誤:', error);
    return { codes: [], addresses: [] };
  }
};

export const loadCallRecords = async (lineUserId: string): Promise<CallRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('call_records')
      .select('*')
      .eq('line_user_id', lineUserId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('載入叫車記錄錯誤:', error);
      return [];
    }

    return (data || []).map(record => ({
      id: record.id,
      carType: record.car_type,
      carTypeLabel: record.car_type_label,
      status: record.status as 'waiting' | 'matched' | 'failed' | 'cancelled',
      timestamp: new Date(record.created_at),
      favoriteType: record.favorite_type,
      favoriteInfo: record.favorite_info || undefined,
      driverInfo: record.driver_name ? {
        name: record.driver_name,
        phone: record.driver_phone || '',
        plateNumber: record.driver_plate_number || '',
        carBrand: record.driver_car_brand || '',
        carColor: record.driver_car_color || ''
      } : undefined
    }));
  } catch (error) {
    console.error('載入叫車記錄錯誤:', error);
    return [];
  }
};

// 獲取所有線上司機的函數
const getOnlineDrivers = async () => {
  try {
    const { data: onlineDrivers, error } = await supabase
      .from('driver_profiles')
      .select('line_user_id, name, driver_id, status, updated_at')
      .eq('status', 'online')
      .not('line_user_id', 'is', null)
      .gte('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // 10分鐘內活躍

    if (error) {
      console.error('❌ 獲取線上司機失敗:', error);
      return [];
    }

    return onlineDrivers || [];
  } catch (error) {
    console.error('❌ 獲取線上司機異常:', error);
    return [];
  }
};

// 通知所有線上司機新訂單
const notifyAllOnlineDrivers = async (orderData: any) => {
  try {
    console.log('🔔 開始通知所有線上司機新訂單:', orderData);
    
    const onlineDrivers = await getOnlineDrivers();

    if (!onlineDrivers || onlineDrivers.length === 0) {
      console.log('📭 目前沒有線上司機');
      return;
    }

    console.log(`📋 找到 ${onlineDrivers.length} 位線上司機:`, onlineDrivers.map(d => ({
      name: d.name,
      lineUserId: d.line_user_id?.substring(0, 10) + '...',
      status: d.status,
      updatedAt: d.updated_at
    })));

    const location = orderData.favorite_type === 'code' ? 
      `代碼: ${orderData.favorite_info}` : 
      orderData.favorite_type === 'address' ? 
      `地址: ${orderData.favorite_info}` : '現在位置';
    
    const lineMessage = `🚕 新訂單通知！\n\n車型：${orderData.car_type_label}\n上車位置：${location}\n\n請儘快查看並接單！`;

    // 發送通知給所有線上司機
    let successCount = 0;
    for (const driver of onlineDrivers) {
      try {
        console.log(`📤 發送通知給司機 ${driver.name}:`, {
          lineUserId: driver.line_user_id?.substring(0, 10) + '...',
          status: driver.status,
          updatedAt: driver.updated_at
        });
        
        const success = await sendLineNotification(driver.line_user_id, lineMessage);
        if (success) {
          successCount++;
          console.log(`✅ 成功通知司機 ${driver.name}`);
        } else {
          console.log(`❌ 通知司機 ${driver.name} 失敗`);
        }
        
        // 增加延遲避免 rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ 通知司機 ${driver.name} 異常:`, error);
      }
    }

    console.log(`🎯 新訂單通知完成：成功 ${successCount}/${onlineDrivers.length} 位司機`);
    
  } catch (error) {
    console.error('❌ 通知線上司機異常:', error);
  }
};

export const createCallRecord = async (
  lineUserId: string,
  carType: string,
  carTypeLabel: string,
  favoriteType: string,
  favoriteInfo: string
) => {
  console.log('📝 開始建立叫車記錄:', { lineUserId: lineUserId.substring(0, 10) + '...', carType, carTypeLabel });
  
  const { data: newRecord, error } = await supabase
    .from('call_records')
    .insert({
      line_user_id: lineUserId,
      car_type: carType,
      car_type_label: carTypeLabel,
      status: 'waiting',
      favorite_type: favoriteType,
      favorite_info: favoriteInfo || null
    })
    .select()
    .single();

  if (error) {
    console.error('❌ 建立叫車記錄失敗:', error);
    throw error;
  }

  console.log('✅ 叫車記錄建立成功:', newRecord.id);

  // 1. 發送叫車確認通知給商家
  try {
    const confirmationMessage = `🚕 叫車請求已送出！\n\n車型：${carTypeLabel}\n狀態：等待司機接單\n\n請耐心等候，我們會在司機接單時立即通知您。`;
    await sendLineNotification(lineUserId, confirmationMessage);
    console.log('✅ 已發送叫車確認通知給商家:', lineUserId.substring(0, 10) + '...');
  } catch (notificationError) {
    console.error('❌ 發送叫車確認通知錯誤:', notificationError);
  }

  // 2. 直接通知所有線上司機新訂單（重要：這是關鍵修改）
  try {
    await notifyAllOnlineDrivers(newRecord);
    console.log('✅ 已通知所有線上司機新訂單');
  } catch (notificationError) {
    console.error('❌ 通知線上司機錯誤:', notificationError);
  }

  return {
    id: newRecord.id,
    carType: newRecord.car_type,
    carTypeLabel: newRecord.car_type_label,
    status: newRecord.status as 'waiting' | 'matched' | 'failed' | 'cancelled',
    timestamp: new Date(newRecord.created_at),
    favoriteType: newRecord.favorite_type,
    favoriteInfo: newRecord.favorite_info || undefined
  };
};

export const updateCallRecord = async (
  recordId: string,
  status: 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
  driverInfo?: {
    name: string;
    phone: string;
    plateNumber: string;
    carBrand: string;
    carColor: string;
  },
  lineUserId?: string
) => {
  const { error } = await supabase
    .from('call_records')
    .update({
      status,
      driver_name: driverInfo?.name || null,
      driver_phone: driverInfo?.phone || null,
      driver_plate_number: driverInfo?.plateNumber || null,
      driver_car_brand: driverInfo?.carBrand || null,
      driver_car_color: driverInfo?.carColor || null
    })
    .eq('id', recordId);

  if (error) {
    throw error;
  }

  // 根據不同狀態發送相應的 LINE 通知給商家
  if (lineUserId) {
    try {
      let message = '';
      
      switch (status) {
        case 'matched':
          if (driverInfo) {
            message = `✅ 司機已接單！\n\n司機資訊：\n👤 姓名：${driverInfo.name}\n📞 電話：${driverInfo.phone}\n🚗 車牌：${driverInfo.plateNumber}\n🚙 車款：${driverInfo.carBrand} (${driverInfo.carColor})\n\n司機正在前往您的位置，請耐心等候！`;
          }
          break;
          
        case 'arrived':
          message = `🎯 司機已抵達！\n\n司機已到達您的位置，請準備上車。\n如有任何問題，請直接聯繫司機。`;
          break;
          
        case 'in_progress':
          message = `🚗 行程開始！\n\n行程已開始進行中，請繫好安全帶。\n祝您旅途愉快！`;
          break;
          
        case 'completed':
          message = `🏁 行程完成！\n\n感謝您使用我們的叫車服務！\n本次行程已順利完成，期待下次為您服務。\n\n💰 回饋金將於明日計算並加入您的帳戶`;
          break;
          
        case 'failed':
          message = `❌ 媒合失敗\n\n很抱歉，目前無法找到合適的司機。\n可能原因：\n• 附近暫無可用司機\n• 尖峰時段需求量大\n\n建議：\n• 稍後再試\n• 選擇其他車型\n• 聯繫客服協助`;
          break;
          
        case 'cancelled':
          message = `🚫 訂單已取消\n\n您的叫車請求已成功取消。\n如需重新叫車，請隨時使用我們的服務。`;
          break;
      }

      if (message) {
        await sendLineNotification(lineUserId, message);
        console.log(`已發送 ${status} 狀態通知給商家 ${lineUserId}`);
      }
    } catch (notificationError) {
      console.error('發送狀態更新通知錯誤:', notificationError);
      // 通知失敗不影響主要功能，記錄錯誤即可
    }
  }
};

export const sendLineNotification = async (lineUserId: string, message: string) => {
  try {
    console.log(`準備發送 LINE 通知給用戶 ${lineUserId}:`, message);
    
    const { data, error } = await supabase.functions.invoke('send-line-notification', {
      body: {
        userId: lineUserId,
        message: message
      }
    });

    if (error) {
      console.error('LINE 推播 API 錯誤:', error);
      throw error;
    }

    console.log('LINE 通知發送成功:', data);
    return data;
  } catch (error) {
    console.error('發送 LINE 通知失敗:', error);
    throw error;
  }
};
