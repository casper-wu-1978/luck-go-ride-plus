
-- 創建用戶角色枚舉類型
CREATE TYPE public.app_role AS ENUM ('driver', 'admin', 'merchant');

-- 創建用戶角色表
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    line_user_id TEXT NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (line_user_id, role)
);

-- 創建管理員表
CREATE TABLE public.admin_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    line_user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    permissions TEXT[] DEFAULT ARRAY['view_orders', 'manage_drivers', 'view_reports'],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 創建商家表
CREATE TABLE public.merchant_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    line_user_id TEXT NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    business_address TEXT,
    business_type TEXT DEFAULT 'restaurant',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 更新司機訂單狀態
ALTER TABLE public.call_records 
ADD COLUMN IF NOT EXISTS driver_id TEXT,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- 創建訂單狀態更新函數
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為新表添加更新時間觸發器
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON public.user_roles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at 
    BEFORE UPDATE ON public.admin_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchant_profiles_updated_at 
    BEFORE UPDATE ON public.merchant_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 啟用 RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;

-- 創建角色檢查函數
CREATE OR REPLACE FUNCTION public.has_role(_line_user_id TEXT, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE line_user_id = _line_user_id
      AND role = _role
  )
$$;

-- RLS 策略
CREATE POLICY "Users can view their own roles" 
    ON public.user_roles 
    FOR SELECT 
    USING (true);

CREATE POLICY "Admins can view admin profiles" 
    ON public.admin_profiles 
    FOR SELECT 
    USING (true);

CREATE POLICY "Merchants can view their own profile" 
    ON public.merchant_profiles 
    FOR SELECT 
    USING (true);

-- 插入一些測試數據
INSERT INTO public.user_roles (line_user_id, role) VALUES 
('U12345678901234567890123456789012', 'merchant'),
('test_admin_user', 'admin'),
('test_driver_user', 'driver');

INSERT INTO public.admin_profiles (line_user_id, name, phone, email) VALUES 
('test_admin_user', '系統管理員', '0900-000-000', 'admin@luckgo.com');

INSERT INTO public.merchant_profiles (line_user_id, business_name, contact_name, phone, business_address) VALUES 
('U12345678901234567890123456789012', '測試餐廳', '王老闆', '0911-111-111', '台北市信義區松高路1號');
