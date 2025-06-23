
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CallRecord } from "@/types/callCar";
import { loadCallRecords, createCallRecord, updateCallRecord } from "@/utils/callCarApi";
import { MAX_CALL_RECORDS } from "@/constants/callCar";

export const useCallRecords = (lineUserId?: string) => {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const { toast } = useToast();

  const loadRecords = useCallback(async () => {
    if (!lineUserId) return;
    console.log('載入叫車記錄:', lineUserId);
    
    // 只載入未完成的訂單（排除 completed 和 cancelled）
    const { data, error } = await supabase
      .from('call_records')
      .select('*')
      .eq('line_user_id', lineUserId)
      .not('status', 'in', '(completed,cancelled)')
      .order('created_at', { ascending: false })
      .limit(MAX_CALL_RECORDS);

    if (error) {
      console.error('載入叫車記錄錯誤:', error);
      return;
    }

    const records: CallRecord[] = (data || []).map(record => ({
      id: record.id,
      carType: record.car_type,
      carTypeLabel: record.car_type_label,
      status: record.status as 'waiting' | 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
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

    setCallRecords(records);
    console.log('載入的叫車記錄數量:', records.length);
  }, [lineUserId]);

  const createRecord = useCallback(async (
    carType: string,
    carTypeLabel: string,
    favoriteType: string,
    favoriteInfo: string
  ) => {
    if (!lineUserId) return null;

    console.log('創建新叫車記錄:', { carType, carTypeLabel, favoriteType, favoriteInfo });
    
    const newCallRecord = await createCallRecord(
      lineUserId,
      carType,
      carTypeLabel,
      favoriteType,
      favoriteInfo
    );

    console.log('新叫車記錄已創建:', newCallRecord);
    setCallRecords(prev => [newCallRecord, ...prev.slice(0, MAX_CALL_RECORDS - 1)]);
    return newCallRecord;
  }, [lineUserId]);

  const cancelRecord = useCallback(async (recordId: string) => {
    console.log('取消叫車記錄:', recordId);
    await updateCallRecord(recordId, 'cancelled', undefined, lineUserId);
    
    // 取消後從列表中移除該記錄
    setCallRecords(prev => prev.filter(record => record.id !== recordId));
  }, [lineUserId]);

  // 穩定的更新函數 - 使用 useCallback 並移除 toast 依賴
  const updateRecordFromRealtime = useCallback((updatedRecord: any) => {
    console.log('🔥🔥🔥 商家端收到實時更新:', {
      id: updatedRecord.id,
      status: updatedRecord.status,
      driver_name: updatedRecord.driver_name,
      timestamp: new Date().toISOString()
    });
    
    setCallRecords(prev => {
      const existingIndex = prev.findIndex(record => record.id === updatedRecord.id);
      console.log('🔥 找到記錄索引:', existingIndex);
      
      // 如果訂單已完成或取消，從列表中移除
      if (updatedRecord.status === 'completed' || updatedRecord.status === 'cancelled') {
        console.log('🔥 訂單已完成或取消，從列表中移除');
        return prev.filter(record => record.id !== updatedRecord.id);
      }
      
      if (existingIndex >= 0) {
        // 更新現有記錄
        const updatedRecords = [...prev];
        const oldRecord = updatedRecords[existingIndex];
        
        updatedRecords[existingIndex] = {
          ...oldRecord,
          status: updatedRecord.status as 'waiting' | 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
          driverInfo: updatedRecord.driver_name ? {
            name: updatedRecord.driver_name,
            phone: updatedRecord.driver_phone || '',
            plateNumber: updatedRecord.driver_plate_number || '',
            carBrand: updatedRecord.driver_car_brand || '',
            carColor: updatedRecord.driver_car_color || ''
          } : undefined
        };
        
        console.log('🔥 更新前記錄:', oldRecord);
        console.log('🔥 更新後記錄:', updatedRecords[existingIndex]);
        
        // 當狀態變更時，觸發 LINE 通知（只有在實時更新時才需要，因為手動更新已經在 updateCallRecord 中處理了）
        if (oldRecord.status !== updatedRecord.status && lineUserId) {
          console.log('🔥 狀態變更，準備發送通知:', oldRecord.status, '->', updatedRecord.status);
          // 這裡不直接調用通知函數，因為通知應該由後端統一處理
          // 避免重複通知的問題
        }
        
        return updatedRecords;
      } else {
        // 新記錄（但只有在未完成狀態時才添加）
        if (updatedRecord.status !== 'completed' && updatedRecord.status !== 'cancelled') {
          console.log('🔥 創建新記錄');
          const newRecord: CallRecord = {
            id: updatedRecord.id,
            carType: updatedRecord.car_type,
            carTypeLabel: updatedRecord.car_type_label,
            status: updatedRecord.status as 'waiting' | 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled',
            timestamp: new Date(updatedRecord.created_at),
            favoriteType: updatedRecord.favorite_type,
            favoriteInfo: updatedRecord.favorite_info || undefined,
            driverInfo: updatedRecord.driver_name ? {
              name: updatedRecord.driver_name,
              phone: updatedRecord.driver_phone || '',
              plateNumber: updatedRecord.driver_plate_number || '',
              carBrand: updatedRecord.driver_car_brand || '',
              carColor: updatedRecord.driver_car_color || ''
            } : undefined
          };
          return [newRecord, ...prev.slice(0, MAX_CALL_RECORDS - 1)];
        }
        return prev;
      }
    });
  }, [lineUserId]);

  useEffect(() => {
    if (lineUserId) {
      loadRecords();
    }
  }, [lineUserId, loadRecords]);

  return {
    callRecords,
    loadRecords,
    createRecord,
    cancelRecord,
    updateRecordFromRealtime,
  };
};
