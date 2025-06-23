
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
}

export interface OrderCompletionData {
  destinationAddress: string;
  distanceKm: number;
  fareAmount: number;
}
