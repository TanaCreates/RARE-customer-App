import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button,ActivityIndicator, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { getDatabase, ref, set, push, get } from 'firebase/database';
import { useRoute, useNavigation } from '@react-navigation/native';
import { app } from '../Screen/firebase';

const Review = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, type } = route.params;

  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemImg, setItemImg] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [rating, setRating] = useState(0);

  useEffect(() => {

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false); 
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, type]); 

  useEffect(() => {
    const db = getDatabase(app);
    const recordRef = ref(db, `${type === 'order' ? 'Orders' : 'bookings'}/${id}`);

    get(recordRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (type === 'booking') {
          setBookingData(data);
          setItemName(data.itemName || 'Unknown Item');
          setItemImg(data.img || '');
          setUserEmail(data.email || '');
        } else if (type === 'order') {
          setOrderData(data);
          setItemName(data.item || 'Unknown Item');
          setItemImg(data.img || '');
          setUserEmail(data.email || '');
        }

        setExistingReview(data.Reviews || null);
      }
      setLoading(false); 
    }).catch((error) => {
      console.error("Error fetching item or reviews:", error);
      setLoading(false);
    });
  }, [id, type]);

  const handleReviewSubmit = () => {
    if (reviewText.trim() === '' || reviewerName.trim() === '' || rating === 0) {
      Alert.alert('Error', 'Please enter your name, review, and select a rating.');
      return;
    }

    const db = getDatabase(app);
    const reviewsRef = ref(db, 'Reviews'); 

    const reviewData = {
      Item: itemName,
      Rating: rating,
      ReviewName: reviewerName,  
      Text: reviewText,
      email: userEmail,
    };

    push(reviewsRef, reviewData)
      .then(() => {
        const recordRef = ref(db, `${type === 'order' ? 'Orders' : 'bookings'}/${id}`);
        set(recordRef, {
          ... (type === 'order' ? orderData : bookingData), 
          Reviews: true, 
        })
        .then(() => {
          Alert.alert('Success', 'Your review has been submitted!');
          setReviewText('');
          setReviewerName('');
          setRating(0);
          navigation.goBack(); 
        })
        .catch((error) => {
          console.error('Error updating Reviews field:', error);
          Alert.alert('Error', 'There was an issue updating the review status.');
        });
      })
      .catch((error) => {
        console.error('Error saving review:', error);
        Alert.alert('Error', 'There was an issue submitting your review.');
      });
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={star <= rating ? styles.filledStar : styles.emptyStar}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {loading ? (
        <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          <Text style={styles.header}>Leave a Review </Text>


          {existingReview ? (
            <Text>Your Review: {existingReview.review}</Text>
          ) : (
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Enter subject"
                value={reviewerName}
                onChangeText={setReviewerName}
              />

              <TextInput
                style={styles.input}
                placeholder="Write your review..."
                value={reviewText}
                onChangeText={setReviewText}
                multiline
              />

              {renderStars()}

<TouchableOpacity style={styles.button} onPress={handleReviewSubmit}>
<Text style={styles.buttonText}>Submit Rating</Text>
</TouchableOpacity>
            </View>
          )}

          {type === 'booking' && bookingData && (
            <View style={styles.detailsContainer}>
              <Text style={styles.textHeader}>Your Booking Details</Text>
              <Text style={styles.text}>Booking Date: {bookingData.bookingDate}</Text>
              <Text style={styles.text}>Booking Time: {bookingData.bookingTime}</Text>
              <Text style={styles.text}>Check-In Time: {bookingData.checkInTime}</Text>
              <Text style={styles.text}>Check-Out Time: {bookingData.checkOutTime}</Text>
              <Text style={styles.text}>Total Price: R{bookingData.totalPrice}</Text>
            </View>
          )}

          {type === 'order' && orderData && (
            <View style={styles.detailsContainer}>
              <Text>Your Order Details</Text>
              <Text>Order Number: {orderData.orderNumber}</Text>
              <Text>Total Price: R{orderData.totalPrice}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#082c24',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  container: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'serif',  // Custom font
color:'#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 24,
color:'#000000',
  },
  itemLabel: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    color:'#000000',

  },

  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    color:'#000000',
    borderRadius: 25,
    padding: 10,
    marginBottom: 20,
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
  },
  detailsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 28,
    color:'#000000',
    width: '90%',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filledStar: {
    color: '#223d3c',
    fontSize: 30,
  },
  emptyStar: {
    color: '#ddd',
    fontSize: 30,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 10,
    color:'#000000',
  },
  textHeader:{
    fontSize: 18,
    marginBottom: 2,
    color:'#000000',
  },
  text: {
    fontSize: 14,
    color:'#000000',
  },
});

export default Review;
