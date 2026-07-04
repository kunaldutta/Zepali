import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';
import {submitFeedback} from '../../services/feedbackService';
import {globalStyles, colors} from '../../styles/globalStyles';

const FeedbackScreen = ({route, navigation}) => {
  console.log('DATA ==',route.params);
  const {product} = route.params;
  console.log('DATA ==2',product);

  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      console.log('DATA ==', product?.product_id, product?.measurement)
      if (!rating) {
        Alert.alert('Error', 'Please select rating');
        return;
      }

      setLoading(true);

      const userData = await AsyncStorage.getItem('USER_DATA');

      const user = JSON.parse(userData);

      const response = await submitFeedback({
        product_id: product?.product_id,
        measurement: product?.measurement,
        user_id: user.id,
        rating,
        comments,
      });

      if (response?.status) {
        Alert.alert(
          'Success',
          response.message,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          response?.message || 'Unable to submit feedback',
        );
      }
    } catch (error) {
      console.log('FEEDBACK ERROR:', error);
      if (error?.message?.includes('Network Error')|| error?.message?.includes('timeout')) {
                    Alert.alert('Connection error', 'Please check your connection');
                    return;
        }
      Alert.alert(
        'Error',
        'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStar = star => {
    return (
      <TouchableOpacity
        key={star}
        onPress={() => setRating(star)}>
        <Text
          style={[
            styles.star,
            star <= rating && styles.selectedStar,
          ]}>
          ★
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <AppHeader
        title="Rate Product"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.container}>
        <Text style={styles.title}>
          How was your product?
        </Text>

        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map(renderStar)}
        </View>

        <TextInput
          style={styles.commentInput}
          placeholder="Write your review..."
          multiline
          value={comments}
          onChangeText={setComments}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              Submit Feedback
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },

  star: {
    fontSize: 40,
    color: '#D3D3D3',
    marginHorizontal: 5,
  },

  selectedStar: {
    color: '#FFD700',
  },

  commentInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 12,
  },

  submitButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});