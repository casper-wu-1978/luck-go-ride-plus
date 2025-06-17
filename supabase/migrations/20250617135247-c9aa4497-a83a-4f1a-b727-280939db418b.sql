
-- 創建新的 RLS 政策以支援 LINE 用戶
-- 首先刪除現有的政策
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 創建新的政策，允許任何人插入和更新 profiles（因為我們使用開發模式）
-- 在生產環境中，您可能需要更嚴格的政策
CREATE POLICY "Allow profile operations for LINE users" 
  ON public.profiles 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
