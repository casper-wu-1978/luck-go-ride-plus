
-- 在 call_records 表格中新增完成訂單相關欄位
ALTER TABLE public.call_records 
ADD COLUMN destination_address TEXT,
ADD COLUMN distance_km DECIMAL(10,2),
ADD COLUMN fare_amount DECIMAL(10,2);

-- 新增註解說明
COMMENT ON COLUMN public.call_records.destination_address IS '目的地地址';
COMMENT ON COLUMN public.call_records.distance_km IS '行駛公里數';
COMMENT ON COLUMN public.call_records.fare_amount IS '車資費用';
