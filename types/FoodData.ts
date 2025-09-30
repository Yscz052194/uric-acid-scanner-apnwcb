
export interface FoodItem {
  id: string;
  name: string;
  nameEn?: string;
  category: FoodCategory;
  purineContent: number; // mg per 100g
  riskLevel: RiskLevel;
  alternatives?: string[];
  cookingTips?: string[];
  description?: string;
  confidence?: number;
}

export interface FoodLog {
  id: string;
  foodItem: FoodItem;
  portion: number; // in grams
  timestamp: Date;
  imageUri?: string;
  totalPurine: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  gender: 'male' | 'female';
  weight: number; // in kg
  uricAcidLevel?: number; // mg/dL
  dailyPurineLimit: number; // mg per day
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyStats {
  date: string;
  totalPurine: number;
  foodCount: number;
  riskScore: number;
  logs: FoodLog[];
}

export type RiskLevel = 'low' | 'medium' | 'high';

export type FoodCategory = 
  | 'meat' 
  | 'seafood' 
  | 'vegetables' 
  | 'fruits' 
  | 'grains' 
  | 'dairy' 
  | 'beverages' 
  | 'legumes'
  | 'nuts'
  | 'processed';

export interface RecognitionResult {
  label: string;
  confidence: number;
  purine_mg: number;
  risk: RiskLevel;
  suggestions: string[];
  source: string[];
  alternatives?: string[];
}
