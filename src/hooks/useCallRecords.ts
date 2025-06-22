
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CallRecord } from "@/types/callCar";
import { loadCallRecords, createCallRecord, updateCallRecord } from "@/utils/callCarApi";
import { MAX_CALL_RECORDS } from "@/constants/callCar";

export const useCallRecords = (lineUserId?: string) => {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const { toast } = useToast();

  const loadRecords = async () => {
    if (!lineUserId) return;
    const records = await loadCallRecords(lineUserId);
    setCallRecords(records);
  };

  const createRecord = async (
    carType: string,
    carTypeLabel: string,
    favoriteType: string,
    favoriteInfo: string
  ) => {
    if (!lineUserId) return null;

    const newCallRecord = await createCallRecord(
      lineUserId,
      carType,
      carTypeLabel,
      favoriteType,
      favoriteInfo
    );

    setCallRecords(prev => [newCallRecord, ...prev.slice(0, MAX_CALL_RECORDS - 1)]);
    return newCallRecord;
  };

  const cancelRecord = async (recordId: string) => {
    await updateCallRecord(recordId, 'cancelled');
    setCallRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, status: 'cancelled' }
          : record
      )
    );
  };

  const updateRecordFromRealtime = (updatedRecord: any) => {
    setCallRecords(prev => 
      prev.map(record => 
        record.id === updatedRecord.id 
          ? {
              ...record,
              status: updatedRecord.status as 'waiting' | 'matched' | 'failed' | 'cancelled',
              driverInfo: updatedRecord.driver_name ? {
                name: updatedRecord.driver_name,
                phone: updatedRecord.driver_phone || '',
                plateNumber: updatedRecord.driver_plate_number || '',
                carBrand: updatedRecord.driver_car_brand || '',
                carColor: updatedRecord.driver_car_color || ''
              } : undefined
            }
          : record
      )
    );

    // 顯示通知
    if (updatedRecord.status === 'matched') {
      toast({
        title: "叫車成功！",
        description: `司機 ${updatedRecord.driver_name} 已接單，請準備上車`,
      });
    } else if (updatedRecord.status === 'failed') {
      toast({
        title: "叫車失敗",
        description: "未能找到合適的司機，請稍後再試",
        variant: "destructive"
      });
    }
  };

  return {
    callRecords,
    loadRecords,
    createRecord,
    cancelRecord,
    updateRecordFromRealtime,
  };
};
