
import { FoodItem, RiskLevel } from '../types/FoodData';

export const foodDatabase: FoodItem[] = [
  // High purine foods (>150mg/100g)
  {
    id: '1',
    name: '带鱼',
    nameEn: 'Hairtail Fish',
    category: 'seafood',
    purineContent: 420,
    riskLevel: 'high',
    alternatives: ['鳕鱼', '草鱼', '鲫鱼'],
    cookingTips: ['减少份量', '避免油炸', '搭配蔬菜'],
    description: '深海鱼类，嘌呤含量极高'
  },
  {
    id: '2',
    name: '动物肝脏',
    nameEn: 'Animal Liver',
    category: 'meat',
    purineContent: 380,
    riskLevel: 'high',
    alternatives: ['瘦肉', '鸡胸肉', '豆腐'],
    cookingTips: ['完全避免', '用豆制品替代'],
    description: '内脏类食物，嘌呤含量最高'
  },
  {
    id: '3',
    name: '小龙虾',
    nameEn: 'Crayfish',
    category: 'seafood',
    purineContent: 350,
    riskLevel: 'high',
    alternatives: ['白肉鱼', '鸡肉', '蛋类'],
    cookingTips: ['限制份量', '去头去壳', '多喝水'],
    description: '甲壳类海鲜，嘌呤含量很高'
  },
  {
    id: '4',
    name: '沙丁鱼',
    nameEn: 'Sardine',
    category: 'seafood',
    purineContent: 295,
    riskLevel: 'high',
    alternatives: ['三文鱼', '鳕鱼', '金枪鱼'],
    cookingTips: ['减少食用频率', '搭配碱性食物'],
    description: '小型海鱼，嘌呤含量高'
  },
  
  // Medium purine foods (50-150mg/100g)
  {
    id: '5',
    name: '猪肉',
    nameEn: 'Pork',
    category: 'meat',
    purineContent: 120,
    riskLevel: 'medium',
    alternatives: ['鸡胸肉', '鱼肉', '豆腐'],
    cookingTips: ['选择瘦肉', '适量食用', '去皮烹饪'],
    description: '常见肉类，适量食用'
  },
  {
    id: '6',
    name: '牛肉',
    nameEn: 'Beef',
    category: 'meat',
    purineContent: 110,
    riskLevel: 'medium',
    alternatives: ['鸡肉', '鱼肉', '蛋白'],
    cookingTips: ['选择瘦肉部位', '控制份量', '搭配蔬菜'],
    description: '红肉类，营养丰富但需控制'
  },
  {
    id: '7',
    name: '鸡肉',
    nameEn: 'Chicken',
    category: 'meat',
    purineContent: 85,
    riskLevel: 'medium',
    alternatives: ['鱼肉', '豆腐', '蛋类'],
    cookingTips: ['去皮食用', '选择胸肉', '清淡烹饪'],
    description: '白肉类，相对较安全'
  },
  {
    id: '8',
    name: '豆腐',
    nameEn: 'Tofu',
    category: 'legumes',
    purineContent: 68,
    riskLevel: 'medium',
    alternatives: ['蛋类', '奶制品', '坚果'],
    cookingTips: ['适量食用', '搭配蔬菜', '清淡调味'],
    description: '植物蛋白，相对安全'
  },
  
  // Low purine foods (<50mg/100g)
  {
    id: '9',
    name: '白菜',
    nameEn: 'Chinese Cabbage',
    category: 'vegetables',
    purineContent: 12,
    riskLevel: 'low',
    alternatives: [],
    cookingTips: ['可以多吃', '有助排尿酸', '富含维生素'],
    description: '绿叶蔬菜，有助降尿酸'
  },
  {
    id: '10',
    name: '苹果',
    nameEn: 'Apple',
    category: 'fruits',
    purineContent: 5,
    riskLevel: 'low',
    alternatives: [],
    cookingTips: ['可以多吃', '富含维生素C', '有助代谢'],
    description: '水果类，安全食用'
  },
  {
    id: '11',
    name: '牛奶',
    nameEn: 'Milk',
    category: 'dairy',
    purineContent: 3,
    riskLevel: 'low',
    alternatives: [],
    cookingTips: ['推荐食用', '富含蛋白质', '有助降尿酸'],
    description: '乳制品，有助降低尿酸'
  },
  {
    id: '12',
    name: '鸡蛋',
    nameEn: 'Egg',
    category: 'dairy',
    purineContent: 8,
    riskLevel: 'low',
    alternatives: [],
    cookingTips: ['优质蛋白', '可以常吃', '多种烹饪方式'],
    description: '蛋类，优质蛋白来源'
  },
  {
    id: '13',
    name: '米饭',
    nameEn: 'Rice',
    category: 'grains',
    purineContent: 15,
    riskLevel: 'low',
    alternatives: [],
    cookingTips: ['主食选择', '提供能量', '可以正常食用'],
    description: '主食类，安全食用'
  },
  {
    id: '14',
    name: '土豆',
    nameEn: 'Potato',
    category: 'vegetables',
    purineContent: 18,
    riskLevel: 'low',
    alternatives: [],
    cookingTips: ['可以多吃', '富含钾', '有助排尿酸'],
    description: '根茎类蔬菜，有助降尿酸'
  },
  {
    id: '15',
    name: '西红柿',
    nameEn: 'Tomato',
    category: 'vegetables',
    purineContent: 10,
    riskLevel: 'low',
    alternatives: [],
    cookingTips: ['推荐食用', '富含维生素', '抗氧化'],
    description: '蔬菜类，营养丰富'
  }
];

export const getRiskColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'low':
      return '#4CAF50';
    case 'medium':
      return '#FF9800';
    case 'high':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

export const getRiskText = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'low':
      return '低风险';
    case 'medium':
      return '中风险';
    case 'high':
      return '高风险';
    default:
      return '未知';
  }
};

export const searchFood = (query: string): FoodItem[] => {
  const lowerQuery = query.toLowerCase();
  return foodDatabase.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    (food.nameEn && food.nameEn.toLowerCase().includes(lowerQuery))
  );
};

export const getFoodById = (id: string): FoodItem | undefined => {
  return foodDatabase.find(food => food.id === id);
};

export const getFoodsByCategory = (category: string): FoodItem[] => {
  return foodDatabase.filter(food => food.category === category);
};

export const calculateDailyPurineLimit = (weight: number, gender: 'male' | 'female'): number => {
  // General recommendation: 150-300mg per day for gout patients
  // Adjust based on weight and gender
  const baseLimit = gender === 'male' ? 200 : 180;
  const weightFactor = weight / 70; // 70kg as reference
  return Math.round(baseLimit * weightFactor);
};
