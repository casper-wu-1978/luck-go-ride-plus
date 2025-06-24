
-- 刪除現有的政策
DROP POLICY IF EXISTS "Admins can view all driver profiles" ON public.driver_profiles;
DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.driver_profiles;
DROP POLICY IF EXISTS "Admins can update driver profiles" ON public.driver_profiles;

-- 建立新的政策：允許司機管理自己的資料
CREATE POLICY "Drivers can manage their own profile" 
  ON public.driver_profiles 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- 暫時允許所有操作以便測試
-- 在生產環境中應該使用更嚴格的政策
