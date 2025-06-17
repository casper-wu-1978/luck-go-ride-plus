
-- 添加 line_user_id 欄位到 profiles 表
ALTER TABLE public.profiles 
ADD COLUMN line_user_id TEXT;

-- 為 line_user_id 創建唯一索引
CREATE UNIQUE INDEX idx_profiles_line_user_id 
ON public.profiles(line_user_id) 
WHERE line_user_id IS NOT NULL;

-- 更新 RLS 政策以使用 line_user_id（如果需要的話）
-- 注意：由於我們使用的是開發模式的模擬資料，這些政策可能不會立即生效
-- 但為了完整性還是保留原有的 user_id 相關政策
