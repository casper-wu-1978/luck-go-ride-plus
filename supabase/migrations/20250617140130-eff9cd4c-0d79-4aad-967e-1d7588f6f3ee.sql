
-- 為 favorite_addresses 表添加 line_user_id 欄位
ALTER TABLE public.favorite_addresses 
ADD COLUMN IF NOT EXISTS line_user_id TEXT;

-- 刪除現有的 RLS 政策
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.favorite_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.favorite_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.favorite_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.favorite_addresses;

-- 創建新的政策，允許 LINE 用戶操作
CREATE POLICY "Allow address operations for LINE users" 
  ON public.favorite_addresses 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
