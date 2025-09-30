
import { RecognitionResult, FoodItem } from '../types/FoodData';
import { foodDatabase, searchFood } from '../data/foodDatabase';

// Mock AI recognition service
export class FoodRecognitionService {
  private static instance: FoodRecognitionService;

  static getInstance(): FoodRecognitionService {
    if (!FoodRecognitionService.instance) {
      FoodRecognitionService.instance = new FoodRecognitionService();
    }
    return FoodRecognitionService.instance;
  }

  // Mock image recognition - in real app this would call AI service
  async recognizeFood(imageUri: string): Promise<RecognitionResult[]> {
    console.log('Starting food recognition for image:', imageUri);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock recognition results - in real app this would be AI-powered
    const mockResults: RecognitionResult[] = [
      {
        label: '带鱼',
        confidence: 0.87,
        purine_mg: 420,
        risk: 'high',
        suggestions: ['减少份量', '替代：鳕鱼', '多喝水'],
        source: ['ChinaFoodTable', 'USDA'],
        alternatives: ['鳕鱼', '草鱼', '鲫鱼']
      },
      {
        label: '蔬菜',
        confidence: 0.65,
        purine_mg: 15,
        risk: 'low',
        suggestions: ['可以多吃', '有助降尿酸'],
        source: ['ChinaFoodTable'],
        alternatives: []
      }
    ];

    console.log('Recognition completed:', mockResults);
    return mockResults;
  }

  // Text-based food search
  async searchFoodByText(query: string): Promise<FoodItem[]> {
    console.log('Searching food by text:', query);
    
    // Simulate slight delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results = searchFood(query);
    console.log('Search results:', results);
    return results;
  }

  // OCR text recognition (mock)
  async recognizeTextFromImage(imageUri: string): Promise<string[]> {
    console.log('Starting OCR recognition for image:', imageUri);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock OCR results
    const mockTexts = ['小龙虾', '啤酒', '毛豆', '花生米'];
    console.log('OCR completed:', mockTexts);
    return mockTexts;
  }

  // Barcode scanning (mock)
  async recognizeBarcode(imageUri: string): Promise<FoodItem | null> {
    console.log('Starting barcode recognition for image:', imageUri);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock barcode result
    const mockResult = foodDatabase[Math.floor(Math.random() * foodDatabase.length)];
    console.log('Barcode recognition completed:', mockResult);
    return mockResult;
  }

  // Calculate portion size from image (mock)
  async estimatePortionSize(imageUri: string, foodType: string): Promise<number> {
    console.log('Estimating portion size for:', foodType);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock portion estimation (in grams)
    const mockPortion = Math.floor(Math.random() * 200) + 50; // 50-250g
    console.log('Estimated portion:', mockPortion, 'grams');
    return mockPortion;
  }

  // Get food recommendations based on current intake
  async getFoodRecommendations(currentPurineIntake: number, dailyLimit: number): Promise<FoodItem[]> {
    console.log('Getting food recommendations, current intake:', currentPurineIntake, 'limit:', dailyLimit);
    
    const remainingPurine = dailyLimit - currentPurineIntake;
    
    if (remainingPurine <= 50) {
      // Recommend only low purine foods
      return foodDatabase.filter(food => food.riskLevel === 'low').slice(0, 5);
    } else if (remainingPurine <= 150) {
      // Recommend low and some medium purine foods
      return foodDatabase.filter(food => food.riskLevel === 'low' || food.riskLevel === 'medium').slice(0, 5);
    } else {
      // Can recommend all foods but prioritize low risk
      return [...foodDatabase.filter(food => food.riskLevel === 'low'), 
              ...foodDatabase.filter(food => food.riskLevel === 'medium')].slice(0, 5);
    }
  }
}

export const foodRecognitionService = FoodRecognitionService.getInstance();
