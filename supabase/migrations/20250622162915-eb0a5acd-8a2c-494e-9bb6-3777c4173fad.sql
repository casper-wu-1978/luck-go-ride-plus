
-- 檢查現有的 status 約束並移除舊的約束
ALTER TABLE driver_profiles DROP CONSTRAINT IF EXISTS driver_profiles_status_check;

-- 重新建立正確的 status 約束，允許 online, offline, busy 等狀態
ALTER TABLE driver_profiles ADD CONSTRAINT driver_profiles_status_check 
CHECK (status IN ('online', 'offline', 'busy', 'active', 'inactive'));

-- 確保 status 欄位有預設值
ALTER TABLE driver_profiles ALTER COLUMN status SET DEFAULT 'offline';
