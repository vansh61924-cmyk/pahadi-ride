
export type RideType = 'bike' | 'auto' | 'cab' | 'luxury';

export interface RideOption {
  id: RideType;
  name: string;
  pricePerKm: number;
  icon: string;
  capacity: number;
  eta: string;
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
}
