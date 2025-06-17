
-- 創建叫車記錄表
CREATE TABLE public.call_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT NOT NULL,
  car_type TEXT NOT NULL,
  car_type_label TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'matched', 'failed', 'cancelled')),
  favorite_type TEXT NOT NULL CHECK (favorite_type IN ('none', 'code', 'address')),
  favorite_info TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  driver_plate_number TEXT,
  driver_car_brand TEXT,
  driver_car_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;

-- 創建政策，允許 LINE 用戶操作自己的叫車記錄
CREATE POLICY "Users can manage their own call records" 
  ON public.call_records 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 創建更新時間戳的觸發器
CREATE TRIGGER update_call_records_updated_at
  BEFORE UPDATE ON public.call_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
