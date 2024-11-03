import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDatabase, ref, child, get, push, update } from 'firebase/database';

const Reviews = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params; // Get orderId from navigation params

  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      const dbRef = ref(getDatabase());
      try {
        const snapshot = await get(child(dbRef, `Orders/${orderId}`)); // Fetch order details by orderId
        if (snapshot.exists()) {
          const orderData = snapshot.val();
          console.log('Fetched order details:', orderData);

          // Set the necessary details from order data
          setOrderDetails(orderData);
          setUserId(orderData.email || 'Anonymous'); // Fallback to 'Anonymous' if email is missing
        } else {
          console.log('No order details found.');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleReviewSubmit = async () => {
    console.log('User ID:', userId); // Log the user_id for debugging
    console.log('Order Details:', orderDetails); // Log the entire order details for debugging

    // Check if the userId exists
    if (!userId) {
      console.error('Error: userId is undefined');
      return;
    }

    const reviewData = {
      Product_id: orderDetails.items[0]?.item || 'Unknown', // Use the first item or fallback to 'Unknown'
      Rating: rating,
      "Review Name": orderDetails.email,
      Text: review,
      email: userId, // Ensure email is passed correctly
    };

    try {
      const db = getDatabase();
      const reviewsRef = ref(db, 'Reviews');
      await push(reviewsRef, reviewData); // Push the review to the Reviews node

      const orderRef = ref(db, `Orders/${orderId}`);
      await update(orderRef, { Reviews: true }); // Set Reviews flag to true in the order history

      console.log('Review submitted successfully.');
      navigation.navigate('OrderHistory'); // Go back to Order History after submission
    } catch (error) {
      console.error('Error submitting review or updating order:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!orderDetails) {
    return <Text>No order found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leave a Review</Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Rating:</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={star <= rating ? styles.filledStar : styles.star}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.label}>Your Review:</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        value={review}
        onChangeText={setReview}
        placeholder="Write your review here..."
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleReviewSubmit}>
          <Text style={styles.buttonText}>Submit Review</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderName: {
    fontSize: 18,
    marginBottom: 10,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 30,
    color: '#ccc',
  },
  filledStar: {
    fontSize: 30,
    color: '#f5a623',
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#223d3c',
    padding: 15,
    borderRadius: 25
    ,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Reviews;
