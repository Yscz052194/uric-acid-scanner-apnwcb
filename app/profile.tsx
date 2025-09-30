
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert,
  Pressable
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from '@/components/button';
import { colors, commonStyles } from '@/styles/commonStyles';
import { StorageService } from '@/utils/storage';
import { UserProfile } from '@/types/FoodData';
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
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  profileInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dangerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 8,
  },
  dangerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
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
});

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      setUserProfile(profile);
      console.log('Loaded user profile:', profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile-setup');
  };

  const handleClearData = () => {
    Alert.alert(
      '清除所有数据',
      '这将删除您的所有饮食记录和个人档案，此操作不可恢复。确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定清除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              setUserProfile(null);
              Alert.alert('成功', '所有数据已清除', [
                {
                  text: '确定',
                  onPress: () => router.replace('/')
                }
              ]);
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('错误', '清除数据失败，请重试');
            }
          }
        }
      ]
    );
  };

  const getStorageInfo = async () => {
    try {
      const size = await StorageService.getStorageSize();
      const sizeKB = (size / 1024).toFixed(2);
      Alert.alert('存储信息', `当前数据大小: ${sizeKB} KB`);
    } catch (error) {
      console.error('Error getting storage info:', error);
      Alert.alert('错误', '获取存储信息失败');
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGenderText = (gender: 'male' | 'female'): string => {
    return gender === 'male' ? '男性' : '女性';
  };

  const getUricAcidStatus = (level?: number, gender?: 'male' | 'female'): string => {
    if (!level || !gender) return '未设置';
    
    const normalRange = gender === 'male' ? [3.4, 7.0] : [2.4, 6.0];
    
    if (level < normalRange[0]) return '偏低';
    if (level > normalRange[1]) return '偏高 ⚠️';
    return '正常';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '个人档案' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '个人档案' }} />
        <View style={styles.content}>
          <View style={styles.emptyContainer}>
            <IconCircle emoji="👤" size={64} backgroundColor={colors.border} />
            <Text style={styles.emptyText}>
              还没有设置个人档案{'\n'}
              点击下方按钮开始设置
            </Text>
            <View style={{ marginTop: 20, width: '100%' }}>
              <Button onPress={() => router.push('/profile-setup')}>
                设置个人档案
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '个人档案' }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>个人档案</Text>
        <Text style={styles.subtitle}>
          管理您的个人信息和应用设置
        </Text>

        {/* Profile Summary */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <IconCircle 
              emoji={userProfile.gender === 'male' ? '👨' : '👩'} 
              size={64} 
              backgroundColor={colors.primary} 
            />
          </View>
          <Text style={styles.profileName}>
            {getGenderText(userProfile.gender)}用户
          </Text>
          <Text style={styles.profileInfo}>
            创建于 {formatDate(userProfile.createdAt)}
          </Text>
        </View>

        {/* Basic Information */}
        <Text style={styles.sectionTitle}>基本信息</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>性别</Text>
            <Text style={styles.infoValue}>{getGenderText(userProfile.gender)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>体重</Text>
            <Text style={styles.infoValue}>{userProfile.weight} kg</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>血尿酸值</Text>
            <Text style={styles.infoValue}>
              {userProfile.uricAcidLevel ? 
                `${userProfile.uricAcidLevel} mg/dL (${getUricAcidStatus(userProfile.uricAcidLevel, userProfile.gender)})` : 
                '未设置'
              }
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>建议每日嘌呤摄入</Text>
            <Text style={styles.infoValue}>{userProfile.dailyPurineLimit} mg</Text>
          </View>
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>操作</Text>
        
        <Pressable style={styles.actionCard} onPress={handleEditProfile}>
          <View style={styles.actionIcon}>
            <IconCircle emoji="✏️" size={32} backgroundColor={colors.secondary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>编辑档案</Text>
            <Text style={styles.actionSubtitle}>修改个人信息和设置</Text>
          </View>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={getStorageInfo}>
          <View style={styles.actionIcon}>
            <IconCircle emoji="💾" size={32} backgroundColor={colors.grey} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>存储信息</Text>
            <Text style={styles.actionSubtitle}>查看应用数据使用情况</Text>
          </View>
        </Pressable>

        {/* Danger Zone */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>⚠️ 危险操作</Text>
          <Text style={styles.dangerText}>
            清除所有数据将删除您的个人档案和所有饮食记录，此操作不可恢复。
          </Text>
          <Button 
            onPress={handleClearData}
            variant="secondary"
            style={{ backgroundColor: colors.error }}
          >
            清除所有数据
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
