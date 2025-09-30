
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/button';
import { colors, commonStyles } from '@/styles/commonStyles';
import { foodRecognitionService } from '@/services/foodRecognition';
import { RecognitionResult } from '@/types/FoodData';
import { getRiskColor, getRiskText } from '@/data/foodDatabase';

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
  buttonContainer: {
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  confidenceText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  purineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  purineText: {
    fontSize: 16,
    fontWeight: '500',
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
  suggestionsTitle: {
    fontSize: 14,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default function CameraScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recognitionResults, setRecognitionResults] = useState<RecognitionResult[]>([]);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限需要', '需要访问相册权限来选择图片');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setRecognitionResults([]);
        console.log('Photo taken:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('错误', '拍照失败，请重试');
    }
  };

  const handleSelectFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setRecognitionResults([]);
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('错误', '选择图片失败，请重试');
    }
  };

  const handleRecognizeFood = async () => {
    if (!selectedImage) {
      Alert.alert('提示', '请先选择或拍摄一张图片');
      return;
    }

    setLoading(true);
    try {
      const results = await foodRecognitionService.recognizeFood(selectedImage);
      setRecognitionResults(results);
      console.log('Recognition results:', results);
    } catch (error) {
      console.error('Error recognizing food:', error);
      Alert.alert('错误', '识别失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = (result: RecognitionResult) => {
    // Navigate to save screen with result data
    router.push({
      pathname: '/save-food-log',
      params: {
        foodName: result.label,
        purineContent: result.purine_mg.toString(),
        riskLevel: result.risk,
        imageUri: selectedImage || '',
        suggestions: JSON.stringify(result.suggestions),
      }
    });
  };

  const renderResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            正在识别食物...{'\n'}
            请稍候，AI正在分析图片中的食物
          </Text>
        </View>
      );
    }

    if (recognitionResults.length === 0) {
      return null;
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={commonStyles.subtitle}>识别结果</Text>
        {recognitionResults.map((result, index) => (
          <View 
            key={index} 
            style={[
              styles.resultCard,
              { borderLeftColor: getRiskColor(result.risk) }
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultName}>{result.label}</Text>
              <Text style={styles.confidenceText}>
                置信度: {(result.confidence * 100).toFixed(0)}%
              </Text>
            </View>

            <View style={styles.purineInfo}>
              <Text style={styles.purineText}>
                嘌呤含量: {result.purine_mg} mg/100g
              </Text>
              <View style={[
                styles.riskBadge,
                { backgroundColor: getRiskColor(result.risk) }
              ]}>
                <Text style={styles.riskText}>
                  {getRiskText(result.risk)}
                </Text>
              </View>
            </View>

            {result.suggestions.length > 0 && (
              <View>
                <Text style={styles.suggestionsTitle}>建议:</Text>
                {result.suggestions.map((suggestion, idx) => (
                  <Text key={idx} style={styles.suggestionItem}>
                    • {suggestion}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.actionButtons}>
              <Button
                onPress={() => handleSaveResult(result)}
                style={styles.actionButton}
                variant="primary"
              >
                保存记录
              </Button>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '拍照识别',
          headerBackTitle: '返回'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>食物识别</Text>
        <Text style={styles.subtitle}>
          拍摄或选择食物图片，AI将自动识别并分析嘌呤含量
        </Text>

        <View style={styles.buttonContainer}>
          <Button onPress={handleTakePhoto} style={{ marginBottom: 12 }}>
            📷 拍照
          </Button>
          <Button onPress={handleSelectFromGallery} variant="secondary">
            🖼️ 从相册选择
          </Button>
        </View>

        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <Button 
              onPress={handleRecognizeFood}
              loading={loading}
              disabled={loading}
            >
              {loading ? '识别中...' : '🔍 开始识别'}
            </Button>
          </View>
        )}

        {renderResults()}
      </ScrollView>
    </View>
  );
}
