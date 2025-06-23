
export interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: 'waiting' | 'matched' | 'arrived' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
  destinationAddress?: string;
  distanceKm?: number;
  fareAmount?: number;
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
