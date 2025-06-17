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

export const createCallRecord = async (
  lineUserId: string,
  carType: string,
  carTypeLabel: string,
  favoriteType: string,
  favoriteInfo: string
) => {
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
    throw error;
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
  status: 'matched' | 'failed' | 'cancelled',
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

  // Send LINE notification for matched or failed status
  if ((status === 'matched' || status === 'failed') && lineUserId) {
    try {
      let message = '';
      if (status === 'matched' && driverInfo) {
        message = `🚗 叫車成功！\n\n司機資訊：\n姓名：${driverInfo.name}\n電話：${driverInfo.phone}\n車牌：${driverInfo.plateNumber}\n車款：${driverInfo.carBrand} (${driverInfo.carColor})\n\n預計5分鐘後到達，請準備上車！`;
      } else if (status === 'failed') {
        message = `❌ 叫車失敗\n\n很抱歉，目前無法找到合適的司機。\n請稍後再試或選擇其他車型。`;
      }

      if (message) {
        await supabase.functions.invoke('send-line-notification', {
          body: {
            userId: lineUserId,
            message: message
          }
        });
      }
    } catch (error) {
      console.error('發送 LINE 推播錯誤:', error);
      // Don't throw error here, as the main operation (updating record) was successful
    }
  }
};

export const sendLineNotification = async (lineUserId: string, message: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-line-notification', {
      body: {
        userId: lineUserId,
        message: message
      }
    });

    if (error) {
      console.error('LINE 推播錯誤:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('發送 LINE 推播錯誤:', error);
    throw error;
  }
};
