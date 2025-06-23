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
    const records = await loadCallRecords(lineUserId);
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
    await updateCallRecord(recordId, 'cancelled');
    setCallRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, status: 'cancelled' }
          : record
      )
    );
  }, []);

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
        
        return updatedRecords;
      } else {
        // 新記錄
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
    });
  }, []);

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
