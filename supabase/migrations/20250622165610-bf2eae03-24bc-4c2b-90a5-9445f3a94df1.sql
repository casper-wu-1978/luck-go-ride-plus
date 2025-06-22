
-- 確保 call_records 表格支援 realtime 功能
ALTER TABLE public.call_records REPLICA IDENTITY FULL;

-- 將 call_records 表格加入 realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_records;
