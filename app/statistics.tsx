
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Dimensions
} from 'react-native';
import { Stack } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { StorageService, formatDateKey } from '@/utils/storage';
import { FoodLog, UserProfile, DailyStats } from '@/types/FoodData';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { IconCircle } from '@/components/IconCircle';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

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
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  riskDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  riskItem: {
    alignItems: 'center',
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  riskLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  riskCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

export default function StatisticsScreen() {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateWeeklyData = useCallback(async (): Promise<number[]> => {
    const weekData: number[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = formatDateKey(date);
      
      const dayStats = await StorageService.getDailyStats(dateKey);
      weekData.push(dayStats?.totalPurine || 0);
    }
    
    return weekData;
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [logs, profile] = await Promise.all([
        StorageService.getFoodLogs(),
        StorageService.getUserProfile()
      ]);
      
      setFoodLogs(logs);
      setUserProfile(profile);
      
      // Calculate weekly data
      const weekData = await calculateWeeklyData();
      setWeeklyData(weekData);
      
      console.log('Statistics data loaded:', { 
        logsCount: logs.length, 
        hasProfile: !!profile,
        weekData 
      });
    } catch (error) {
      console.error('Error loading statistics data:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateWeeklyData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateStats = () => {
    if (foodLogs.length === 0) {
      return {
        totalLogs: 0,
        totalPurine: 0,
        averagePurine: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
      };
    }

    const totalPurine = foodLogs.reduce((sum, log) => sum + log.totalPurine, 0);
    const highRiskCount = foodLogs.filter(log => log.foodItem.riskLevel === 'high').length;
    const mediumRiskCount = foodLogs.filter(log => log.foodItem.riskLevel === 'medium').length;
    const lowRiskCount = foodLogs.filter(log => log.foodItem.riskLevel === 'low').length;

    return {
      totalLogs: foodLogs.length,
      totalPurine,
      averagePurine: totalPurine / foodLogs.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
    };
  };

  const stats = calculateStats();

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const pieData = [
    {
      name: '高风险',
      population: stats.highRiskCount,
      color: colors.error,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: '中风险',
      population: stats.mediumRiskCount,
      color: colors.warning,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: '低风险',
      population: stats.lowRiskCount,
      color: colors.success,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '统计分析' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (foodLogs.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '统计分析' }} />
        <View style={styles.content}>
          <Text style={styles.title}>统计分析</Text>
          <View style={styles.emptyContainer}>
            <IconCircle emoji="📊" size={64} backgroundColor={colors.border} />
            <Text style={styles.emptyText}>
              还没有足够的数据进行分析{'\n'}
              开始记录饮食来查看统计信息吧！
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '统计分析' }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>统计分析</Text>
        <Text style={styles.subtitle}>
          基于您的饮食记录生成的数据分析
        </Text>

        {/* Overall Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>总体统计</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalLogs}</Text>
              <Text style={styles.statLabel}>记录次数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalPurine.toFixed(0)}</Text>
              <Text style={styles.statLabel}>总嘌呤摄入 (mg)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averagePurine.toFixed(0)}</Text>
              <Text style={styles.statLabel}>平均每次 (mg)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userProfile ? Math.round((stats.totalPurine / userProfile.dailyPurineLimit) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>占建议摄入量</Text>
            </View>
          </View>
        </View>

        {/* Weekly Trend */}
        {weeklyData.length > 0 && weeklyData.some(value => value > 0) && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>近7天嘌呤摄入趋势</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: ['6天前', '5天前', '4天前', '3天前', '2天前', '昨天', '今天'],
                  datasets: [
                    {
                      data: weeklyData,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                yAxisSuffix=" mg"
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
        )}

        {/* Risk Distribution */}
        {pieData.length > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>风险等级分布</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            </View>
            <View style={styles.riskDistribution}>
              <View style={styles.riskItem}>
                <View style={[styles.riskDot, { backgroundColor: colors.success }]} />
                <Text style={styles.riskLabel}>低风险</Text>
                <Text style={styles.riskCount}>{stats.lowRiskCount}</Text>
              </View>
              <View style={styles.riskItem}>
                <View style={[styles.riskDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.riskLabel}>中风险</Text>
                <Text style={styles.riskCount}>{stats.mediumRiskCount}</Text>
              </View>
              <View style={styles.riskItem}>
                <View style={[styles.riskDot, { backgroundColor: colors.error }]} />
                <Text style={styles.riskLabel}>高风险</Text>
                <Text style={styles.riskCount}>{stats.highRiskCount}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
