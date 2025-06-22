
export interface BaseProfile {
  id?: string;
  line_user_id?: string;
  name: string;
  phone: string;
  email: string;
}

export interface UserProfile extends BaseProfile {
  business_name: string;
  business_address: string;
}

export interface DriverProfile extends BaseProfile {
  vehicle_type?: string;
  vehicle_brand?: string;
  vehicle_color?: string;
  plate_number?: string;
  license_number?: string;
}
