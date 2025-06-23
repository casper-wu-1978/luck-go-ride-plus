
export interface CallRecord {
  id: string;
  carType: string;
  carTypeLabel: string;
  status: string;
  timestamp: Date;
  favoriteType: string;
  favoriteInfo?: string;
}

export interface OrderCompletionData {
  destinationAddress: string;
  distanceKm: number;
  fareAmount: number;
}
