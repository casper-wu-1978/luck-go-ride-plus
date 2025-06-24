
-- 刪除所有現有的司機資料政策
DROP POLICY IF EXISTS "Drivers can manage their own profile" ON public.driver_profiles;
DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.driver_profiles;
DROP POLICY IF EXISTS "Drivers can insert their own profile" ON public.driver_profiles;
DROP POLICY IF EXISTS "Drivers can update their own profile" ON public.driver_profiles;
DROP POLICY IF EXISTS "Drivers can delete their own profile" ON public.driver_profiles;
DROP POLICY IF EXISTS "Admins can view all driver profiles" ON public.driver_profiles;
DROP POLICY IF EXISTS "Admins can update driver profiles" ON public.driver_profiles;

-- 建立簡化的政策來允許所有司機操作（測試用）
CREATE POLICY "Allow all driver operations" 
  ON public.driver_profiles 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
