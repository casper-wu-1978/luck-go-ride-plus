
-- 更新 call_records 表的狀態約束，加入缺少的狀態
ALTER TABLE call_records DROP CONSTRAINT IF EXISTS call_records_status_check;

-- 重新建立約束，包含所有需要的狀態
ALTER TABLE call_records ADD CONSTRAINT call_records_status_check 
CHECK (status IN ('waiting', 'matched', 'arrived', 'in_progress', 'completed', 'failed', 'cancelled'));
