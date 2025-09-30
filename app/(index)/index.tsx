
import { Stack, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { BodyScrollView } from "@/components/BodyScrollView";
import { IconSymbol } from "@/components/IconSymbol";
import { Button } from "@/components/button";
import { IconCircle } from "@/components/IconCircle";
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Alert,
  Dimensions 
} from "react-native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { StorageService, getTodayKey } from "@/utils/storage";
import { UserProfile, DailyStats } from "@/types/FoodData";
import { calculateDailyPurineLimit } from "@/data/foodDatabase";

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  disclaimerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  disclaimerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      const today = getTodayKey();
      const stats = await StorageService.getDailyStats(today);
      
      setUserProfile(profile);
      setTodayStats(stats);
      
      console.log('Loaded user profile:', profile);
      console.log('Loaded today stats:', stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraPress = () => {
    if (!userProfile) {
      Alert.alert(
        '设置个人档案',
        '请先设置您的个人档案以获得个性化建议',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => router.push('/profile-setup') }
        ]
      );
      return;
    }
    router.push('/camera');
  };

  const handleFoodLogPress = () => {
    router.push('/food-log');
  };

  const handleStatsPress = () => {
    router.push('/statistics');
  };

  const handleProfilePress = () => {
    if (userProfile) {
      router.push('/profile');
    } else {
      router.push('/profile-setup');
    }
  };

  const renderStats = () => {
    if (!userProfile || !todayStats) {
      return (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>今日摄入统计</Text>
          <Text style={commonStyles.textSecondary}>暂无数据</Text>
        </View>
      );
    }

    const purinePercentage = (todayStats.totalPurine / userProfile.dailyPurineLimit) * 100;
    const progressColor = purinePercentage > 100 ? colors.error : 
                         purinePercentage > 80 ? colors.warning : colors.success;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>今日摄入统计</Text>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>嘌呤摄入</Text>
          <Text style={styles.statsValue}>
            {todayStats.totalPurine.toFixed(0)} / {userProfile.dailyPurineLimit} mg
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(purinePercentage, 100)}%`,
                backgroundColor: progressColor 
              }
            ]} 
          />
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>记录次数</Text>
          <Text style={styles.statsValue}>{todayStats.foodCount} 次</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>风险评分</Text>
          <Text style={[styles.statsValue, { color: progressColor }]}>
            {todayStats.riskScore.toFixed(1)} / 10
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: "食物尿酸识别管家"
        }} 
      />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>食物尿酸识别管家</Text>
        <Text style={styles.headerSubtitle}>
          {userProfile ? `欢迎回来，${userProfile.gender === 'male' ? '先生' : '女士'}` : '智能饮食管理助手'}
        </Text>
      </View>

      <BodyScrollView style={styles.content}>
        {renderStats()}

        <View style={styles.actionGrid}>
          <Pressable style={styles.actionCard} onPress={handleCameraPress}>
            <View style={styles.actionIcon}>
              <IconCircle emoji="📷" backgroundColor={colors.primary} size={48} />
            </View>
            <Text style={styles.actionTitle}>拍照识别</Text>
            <Text style={styles.actionSubtitle}>识别食物嘌呤含量</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleFoodLogPress}>
            <View style={styles.actionIcon}>
              <IconCircle emoji="📝" backgroundColor={colors.secondary} size={48} />
            </View>
            <Text style={styles.actionTitle}>饮食日志</Text>
            <Text style={styles.actionSubtitle}>查看历史记录</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleStatsPress}>
            <View style={styles.actionIcon}>
              <IconCircle emoji="📊" backgroundColor={colors.accent} size={48} />
            </View>
            <Text style={styles.actionTitle}>统计分析</Text>
            <Text style={styles.actionSubtitle}>查看趋势图表</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleProfilePress}>
            <View style={styles.actionIcon}>
              <IconCircle emoji="👤" backgroundColor={colors.grey} size={48} />
            </View>
            <Text style={styles.actionTitle}>个人档案</Text>
            <Text style={styles.actionSubtitle}>设置个人信息</Text>
          </Pressable>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            ⚠️ 免责声明：本应用仅供参考，不能替代医生的专业建议。如有健康问题，请咨询专业医师。
          </Text>
        </View>
      </BodyScrollView>
    </View>
  );
}
