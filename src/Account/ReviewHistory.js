import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { auth, db } from '../Screen/firebase'; // Import your Firebase authentication setup
import { ref, get, child } from 'firebase/database'; // Import Realtime Database functions

const ReviewsScreen = () => {
  const [reviews, setReviews] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    // Get the current user
    const fetchUser = () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUserEmail(user.email);
      }
    };

    // Fetch reviews from the database
    const fetchReviews = async () => {
      try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'Reviews'));

        if (snapshot.exists()) {
          const reviewList = [];
          const reviewsData = snapshot.val();

          // Loop through each review
          for (const key in reviewsData) {
            const reviewData = reviewsData[key];
            const productId = reviewData.Product_id || ''; // Handle missing Product_id
            let productImageUrl = '';

            if (productId.includes('A')) {
              // Fetch from sleepingPods
              const podSnapshot = await get(child(dbRef, `sleepingPods/${productId}`));
              if (podSnapshot.exists()) {
                productImageUrl = podSnapshot.val().imageUrl;
              }
            } else {
              // Fetch from Menu
              const menuSnapshot = await get(child(dbRef, `Menu/${productId}`));
              if (menuSnapshot.exists()) {
                productImageUrl = menuSnapshot.val().img;
              }
            }

            // Add the product image URL and review data to the list
            reviewList.push({ id: key, ...reviewData, imageUrl: productImageUrl });
          }

          setReviews(reviewList);
        } else {
          console.log('No reviews found');
        }
      } catch (error) {
        console.error('Error fetching reviews: ', error);
      }
    };

    fetchUser();
    fetchReviews();
  }, []);

  const renderReview = ({ item }) => {
    return (
      <View style={styles.reviewContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <Text style={styles.rating}>{item.Rating} ★★★★★</Text>
        <Text style={styles.name}>{item.email}</Text>
        <Text style={styles.reviewText}>{item.Text}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    margin: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  productImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  rating: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  reviewText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default ReviewsScreen;
