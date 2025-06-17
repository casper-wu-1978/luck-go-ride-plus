
export interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: 'waiting' | 'matched' | 'failed' | 'cancelled';
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
  driverInfo?: {
    name: string;
    phone: string;
    plateNumber: string;
    carBrand: string;
    carColor: string;
  };
}

export interface FavoriteCode {
  id: string;
  label: string;
}

export interface FavoriteAddress {
  id: number;
  name: string;
  address: string;
}
