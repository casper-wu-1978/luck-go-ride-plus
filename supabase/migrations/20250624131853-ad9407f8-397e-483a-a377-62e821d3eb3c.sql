
-- 啟用 driver_profiles 表格的 Row Level Security
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

-- 建立政策：允許管理員查看所有司機資料
CREATE POLICY "Admins can view all driver profiles" 
  ON public.driver_profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE line_user_id = (
        SELECT raw_user_meta_data->>'sub' 
        FROM auth.users 
        WHERE id = auth.uid()
      ) 
      AND role = 'admin'
    )
  );

-- 建立政策：允許司機查看自己的資料
CREATE POLICY "Drivers can view their own profile" 
  ON public.driver_profiles 
  FOR SELECT 
  USING (
    line_user_id = (
      SELECT raw_user_meta_data->>'sub' 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- 建立政策：允許管理員更新司機狀態
CREATE POLICY "Admins can update driver profiles" 
  ON public.driver_profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE line_user_id = (
        SELECT raw_user_meta_data->>'sub' 
        FROM auth.users 
        WHERE id = auth.uid()
      ) 
      AND role = 'admin'
    )
  );
