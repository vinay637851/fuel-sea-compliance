export interface Route {
  routeId: string;
  vesselType: "Container" | "BulkCarrier" | "Tanker" | "RoRo";
  fuelType: "HFO" | "LNG" | "MGO";
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline?: boolean;
}

export interface ComparisonData {
  baseline: Route;
  comparison: Route;
  percentDiff: number;
  compliant: boolean;
}

export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGCO2eq: number;
  cbBefore?: number;
  cbAfter?: number;
  applied?: number;
}

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGCO2eq: number;
  createdAt: string;
}

export interface Pool {
  id: string;
  year: number;
  members: PoolMember[];
  totalCB: number;
  isValid: boolean;
}

export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}
