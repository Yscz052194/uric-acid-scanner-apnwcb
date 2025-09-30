
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image,
  Pressable,
  Alert,
  RefreshControl
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { StorageService } from '@/utils/storage';
import { FoodLog } from '@/types/FoodData';
import { getRiskColor, getRiskText } from '@/data/foodDatabase';
import { IconCircle } from '@/components/IconCircle';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
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
  },
  logItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  logDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  purineText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
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
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default function FoodLogScreen() {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFoodLogs();
  }, []);

  const loadFoodLogs = async () => {
    try {
      const logs = await StorageService.getFoodLogs();
      // Sort by timestamp, newest first
      const sortedLogs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setFoodLogs(sortedLogs);
      console.log('Loaded food logs:', sortedLogs.length);
    } catch (error) {
      console.error('Error loading food logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFoodLogs();
    setRefreshing(false);
  };

  const handleDeleteLog = (logId: string) => {
    Alert.alert(
      '删除记录',
      '确定要删除这条饮食记录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteFoodLog(logId);
              await loadFoodLogs(); // Reload the list
              Alert.alert('成功', '记录已删除');
            } catch (error) {
              console.error('Error deleting log:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          }
        }
      ]
    );
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLogItem = ({ item }: { item: FoodLog }) => (
    <Pressable 
      style={[
        styles.logItem,
        { borderLeftColor: getRiskColor(item.foodItem.riskLevel) }
      ]}
      onLongPress={() => handleDeleteLog(item.id)}
    >
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.foodImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <IconCircle emoji="🍽️" size={24} backgroundColor={colors.border} />
        </View>
      )}
      
      <View style={styles.logContent}>
        <View style={styles.logHeader}>
          <Text style={styles.foodName} numberOfLines={1}>
            {item.foodItem.name}
          </Text>
          <View style={[
            styles.riskBadge,
            { backgroundColor: getRiskColor(item.foodItem.riskLevel) }
          ]}>
            <Text style={styles.riskText}>
              {getRiskText(item.foodItem.riskLevel)}
            </Text>
          </View>
        </View>
        
        <View style={styles.logDetails}>
          <Text style={styles.detailText}>
            {item.portion}g
          </Text>
          <Text style={styles.purineText}>
            {item.totalPurine.toFixed(1)} mg 嘌呤
          </Text>
        </View>
        
        <Text style={styles.timeText}>
          {formatTime(item.timestamp)}
        </Text>
        
        {item.notes && (
          <Text style={[styles.detailText, { marginTop: 4 }]} numberOfLines={2}>
            备注: {item.notes}
          </Text>
        )}
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconCircle emoji="📝" size={64} backgroundColor={colors.border} />
      <Text style={styles.emptyText}>
        还没有饮食记录{'\n'}
        点击首页的"拍照识别"开始记录吧！
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '饮食日志',
          headerBackTitle: '返回'
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>饮食日志</Text>
          <Text style={styles.subtitle}>
            长按记录可以删除
          </Text>
        </View>

        <FlatList
          data={foodLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={loading ? null : renderEmptyState}
        />
      </View>
    </View>
  );
}
