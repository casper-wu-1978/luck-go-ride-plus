
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
    console.log('載入叫車記錄:', lineUserId);
    const records = await loadCallRecords(lineUserId);
    setCallRecords(records);
    console.log('載入的叫車記錄數量:', records.length);
  };

  const createRecord = async (
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
  };

  const cancelRecord = async (recordId: string) => {
    console.log('取消叫車記錄:', recordId);
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
    console.log('🔥 商家端 - 處理實時更新的記錄:', updatedRecord);
    console.log('🔥 商家端 - 記錄ID:', updatedRecord.id);
    console.log('🔥 商家端 - 更新前的狀態:', updatedRecord.status);
    console.log('🔥 商家端 - 司機資訊:', updatedRecord.driver_name ? `${updatedRecord.driver_name} (${updatedRecord.driver_phone})` : '無');
    
    // 顯示處理實時更新的提示
    toast({
      title: "🔥 處理實時更新",
      description: `記錄ID: ${updatedRecord.id?.slice(-4)}, 狀態: ${updatedRecord.status}`,
    });
    
    setCallRecords(prev => {
      console.log('🔥 商家端 - 當前記錄列表:', prev.map(r => ({ id: r.id, status: r.status })));
      
      const existingIndex = prev.findIndex(record => record.id === updatedRecord.id);
      console.log('🔥 商家端 - 找到的記錄索引:', existingIndex);
      
      if (existingIndex >= 0) {
        // 顯示找到現有記錄的提示
        toast({
          title: "🔥 更新現有記錄",
          description: `索引: ${existingIndex}, 舊狀態: ${prev[existingIndex].status} -> 新狀態: ${updatedRecord.status}`,
        });
        
        // 更新現有記錄
        const updatedRecords = [...prev];
        const oldRecord = updatedRecords[existingIndex];
        
        updatedRecords[existingIndex] = {
          ...oldRecord,
          status: updatedRecord.status as 'waiting' | 'matched' | 'failed' | 'cancelled',
          driverInfo: updatedRecord.driver_name ? {
            name: updatedRecord.driver_name,
            phone: updatedRecord.driver_phone || '',
            plateNumber: updatedRecord.driver_plate_number || '',
            carBrand: updatedRecord.driver_car_brand || '',
            carColor: updatedRecord.driver_car_color || ''
          } : undefined
        };
        
        console.log('🔥 商家端 - 更新前記錄:', oldRecord);
        console.log('🔥 商家端 - 更新後記錄:', updatedRecords[existingIndex]);
        console.log('🔥 商家端 - 狀態變化:', oldRecord.status, '->', updatedRecords[existingIndex].status);
        
        // 強制觸發重新渲染
        setTimeout(() => {
          console.log('🔥 商家端 - 強制重新渲染狀態更新');
          toast({
            title: "🔥 狀態更新完成",
            description: `記錄狀態已更新為: ${updatedRecord.status}`,
          });
        }, 200);
        
        return updatedRecords;
      } else {
        // 顯示創建新記錄的提示
        toast({
          title: "🔥 創建新記錄",
          description: `找不到現有記錄，創建新記錄: ${updatedRecord.id?.slice(-4)}`,
        });
        
        // 新記錄（通常不會發生，因為INSERT事件應該通過createRecord處理）
        console.log('🔥 商家端 - 找不到現有記錄，創建新記錄');
        const newRecord: CallRecord = {
          id: updatedRecord.id,
          carType: updatedRecord.car_type,
          carTypeLabel: updatedRecord.car_type_label,
          status: updatedRecord.status as 'waiting' | 'matched' | 'failed' | 'cancelled',
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
        console.log('🔥 商家端 - 新增記錄:', newRecord);
        return [newRecord, ...prev.slice(0, MAX_CALL_RECORDS - 1)];
      }
    });

    // 顯示通知
    if (updatedRecord.status === 'matched') {
      console.log('🔥 商家端 - 顯示媒合成功通知:', updatedRecord.driver_name);
      toast({
        title: "叫車成功！",
        description: `司機 ${updatedRecord.driver_name} 已接單，請準備上車`,
      });
    } else if (updatedRecord.status === 'failed') {
      console.log('🔥 商家端 - 顯示媒合失敗通知');
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
