
export interface RunRecord {
  id: string;
  date: string;
  totalEarnings: number;
  kmDriven: number;
  hoursWorked?: number;
  additionalCosts?: number;
}

export interface AppSettings {
  costPerKm: number;
}

export interface CalculationResult {
  grossProfit: number;
  carCost: number;
  netProfit: number;
  profitPerKm: number;
  profitPerHour: number;
}
