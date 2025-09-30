
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/button';
import { colors, commonStyles } from '@/styles/commonStyles';
import { StorageService, getTodayKey } from '@/utils/storage';
import { FoodLog, FoodItem, UserProfile, DailyStats } from '@/types/FoodData';
import { getRiskColor, getRiskText, getFoodById } from '@/data/foodDatabase';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  foodImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  foodCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  foodName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  purineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  purineText: {
    fontSize: 16,
    color: colors.text,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  calculationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  totalPurine: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  suggestionsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  suggestionItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    paddingLeft: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default function SaveFoodLogScreen() {
  const params = useLocalSearchParams();
  const [portion, setPortion] = useState('100');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const foodName = params.foodName as string;
  const purineContent = parseFloat(params.purineContent as string);
  const riskLevel = params.riskLevel as 'low' | 'medium' | 'high';
  const imageUri = params.imageUri as string;
  const suggestions = params.suggestions ? JSON.parse(params.suggestions as string) : [];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const calculateTotalPurine = () => {
    const portionNum = parseFloat(portion) || 0;
    return (purineContent * portionNum) / 100;
  };

  const handleSave = async () => {
    const portionNum = parseFloat(portion);
    if (!portion || isNaN(portionNum) || portionNum <= 0) {
      Alert.alert('错误', '请输入有效的食用份量');
      return;
    }

    if (portionNum > 1000) {
      Alert.alert('提示', '份量似乎过大，请确认是否正确');
      return;
    }

    setLoading(true);

    try {
      const totalPurine = calculateTotalPurine();
      
      // Create food item
      const foodItem: FoodItem = {
        id: Date.now().toString(),
        name: foodName,
        category: 'processed', // Default category for recognized foods
        purineContent: purineContent,
        riskLevel: riskLevel,
        alternatives: [],
        cookingTips: suggestions,
      };

      // Create food log
      const foodLog: FoodLog = {
        id: Date.now().toString(),
        foodItem: foodItem,
        portion: portionNum,
        timestamp: new Date(),
        imageUri: imageUri,
        totalPurine: totalPurine,
        notes: notes,
      };

      // Save food log
      await StorageService.saveFoodLog(foodLog);

      // Update daily stats
      const today = getTodayKey();
      let todayStats = await StorageService.getDailyStats(today);
      
      if (!todayStats) {
        todayStats = {
          date: today,
          totalPurine: 0,
          foodCount: 0,
          riskScore: 0,
          logs: [],
        };
      }

      todayStats.totalPurine += totalPurine;
      todayStats.foodCount += 1;
      todayStats.logs.push(foodLog);
      
      // Calculate risk score (0-10 scale)
      if (userProfile) {
        const purinePercentage = todayStats.totalPurine / userProfile.dailyPurineLimit;
        todayStats.riskScore = Math.min(purinePercentage * 10, 10);
      }

      await StorageService.saveDailyStats(todayStats);

      Alert.alert(
        '保存成功',
        `已记录 ${foodName} (${portionNum}g)\n嘌呤摄入: ${totalPurine.toFixed(1)}mg`,
        [
          {
            text: '确定',
            onPress: () => {
              router.back();
              router.back(); // Go back to home screen
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving food log:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '保存记录',
          headerBackTitle: '返回'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.foodImage} />
          </View>
        )}

        <View style={[
          styles.foodCard,
          { borderLeftColor: getRiskColor(riskLevel) }
        ]}>
          <Text style={styles.foodName}>{foodName}</Text>
          <View style={styles.purineInfo}>
            <Text style={styles.purineText}>
              嘌呤含量: {purineContent} mg/100g
            </Text>
            <View style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(riskLevel) }
            ]}>
              <Text style={styles.riskText}>
                {getRiskText(riskLevel)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>食用份量 (克) *</Text>
          <TextInput
            style={styles.input}
            value={portion}
            onChangeText={setPortion}
            placeholder="请输入食用份量，如：150"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <View style={styles.calculationCard}>
          <Text style={styles.calculationTitle}>营养计算</Text>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>食用份量</Text>
            <Text style={styles.calculationValue}>{portion || '0'} 克</Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>嘌呤密度</Text>
            <Text style={styles.calculationValue}>{purineContent} mg/100g</Text>
          </View>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>总嘌呤摄入</Text>
            <Text style={styles.totalPurine}>
              {calculateTotalPurine().toFixed(1)} mg
            </Text>
          </View>
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>💡 建议</Text>
            {suggestions.map((suggestion: string, index: number) => (
              <Text key={index} style={styles.suggestionItem}>
                • {suggestion}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>备注 (可选)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="记录用餐时间、感受或其他信息..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={200}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存到日志'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
