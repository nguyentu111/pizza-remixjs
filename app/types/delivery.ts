export interface Instruction {
  text: string;
  distance: number;
  time: number;
  sign: number;
  latitude: number;
  longitude: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface DetailedRoute {
  points: RoutePoint[];
  instructions: Instruction[];
  distance: number;
  time: number;
}

export interface OptimizedStep {
  orderId: string;
  latitude: number;
  longitude: number;
  distance: number;
  duration: number;
}

export interface OptimizedRoute {
  distance: number;
  duration: number;
  steps: OptimizedStep[];
}

export interface CalculatedRoute {
  route: OptimizedRoute;
  detailedRoutes: DetailedRoute[];
}
