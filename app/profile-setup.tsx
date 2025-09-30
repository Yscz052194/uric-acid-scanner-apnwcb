
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/button';
import { colors, commonStyles } from '@/styles/commonStyles';
import { StorageService } from '@/utils/storage';
import { UserProfile } from '@/types/FoodData';
import { calculateDailyPurineLimit } from '@/data/foodDatabase';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
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
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 16,
    color: colors.text,
  },
  genderTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 32,
  },
});

export default function ProfileSetupScreen() {
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [weight, setWeight] = useState('');
  const [uricAcidLevel, setUricAcidLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!gender) {
      Alert.alert('错误', '请选择性别');
      return;
    }

    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum < 30 || weightNum > 200) {
      Alert.alert('错误', '请输入有效的体重 (30-200kg)');
      return;
    }

    const uricAcidNum = uricAcidLevel ? parseFloat(uricAcidLevel) : undefined;
    if (uricAcidLevel && (isNaN(uricAcidNum!) || uricAcidNum! < 2 || uricAcidNum! > 15)) {
      Alert.alert('错误', '请输入有效的血尿酸值 (2-15 mg/dL)');
      return;
    }

    setLoading(true);

    try {
      const dailyLimit = calculateDailyPurineLimit(weightNum, gender);
      
      const profile: UserProfile = {
        id: Date.now().toString(),
        gender,
        weight: weightNum,
        uricAcidLevel: uricAcidNum,
        dailyPurineLimit: dailyLimit,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.saveUserProfile(profile);
      
      Alert.alert(
        '设置成功',
        `个人档案已保存！\n建议每日嘌呤摄入量：${dailyLimit}mg`,
        [
          {
            text: '确定',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{ 
          title: '设置个人档案',
          headerBackTitle: '返回'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>设置个人档案</Text>
        <Text style={styles.subtitle}>
          为您提供个性化的饮食建议和嘌呤摄入量推荐
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>性别 *</Text>
          <View style={styles.genderContainer}>
            <Button
              onPress={() => setGender('male')}
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonActive
              ]}
            >
              <Text style={[
                styles.genderText,
                gender === 'male' && styles.genderTextActive
              ]}>
                男性
              </Text>
            </Button>
            <Button
              onPress={() => setGender('female')}
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonActive
              ]}
            >
              <Text style={[
                styles.genderText,
                gender === 'female' && styles.genderTextActive
              ]}>
                女性
              </Text>
            </Button>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>体重 (kg) *</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="请输入您的体重"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>血尿酸值 (mg/dL) 可选</Text>
          <TextInput
            style={styles.input}
            value={uricAcidLevel}
            onChangeText={setUricAcidLevel}
            placeholder="如果知道请输入，用于更精确的建议"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 提示：{'\n'}
            • 正常血尿酸值：男性 3.4-7.0 mg/dL，女性 2.4-6.0 mg/dL{'\n'}
            • 高尿酸血症：男性 {'>'}7.0 mg/dL，女性 {'>'}6.0 mg/dL{'\n'}
            • 我们会根据您的信息计算个性化的每日嘌呤摄入建议
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          >
            保存档案
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
