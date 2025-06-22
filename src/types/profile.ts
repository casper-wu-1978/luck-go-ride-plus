
export interface UserProfile {
  id?: string;
  line_user_id?: string;
  name: string;
  phone: string;
  email: string;
  // 移除商家相關欄位
  // business_name: string;
  // business_address: string;
}

export interface DriverProfile extends UserProfile {
  vehicle_type?: string;
  vehicle_brand?: string;
  vehicle_color?: string;
  plate_number?: string;
  license_number?: string;
}
