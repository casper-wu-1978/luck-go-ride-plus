
export interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: string;
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
  merchantInfo?: {
    businessName: string;
    contactName: string;
    phone: string;
    businessAddress: string;
  };
  driverInfo?: {
    name: string;
    phone: string;
    plateNumber: string;
    carBrand: string;
    carColor: string;
  };
}

export interface OrderCompletionData {
  destinationAddress: string;
  distanceKm: number;
  fareAmount: number;
}
