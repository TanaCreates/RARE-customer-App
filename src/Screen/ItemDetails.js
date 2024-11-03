import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { db, auth } from './firebase'; // Ensure Firebase is configured correctly

const ItemDetails = ({ route, navigation }) => {
  const { item, category } = route.params; // Extract the item key and category from the route params

  const [itemDetails, setItemDetails] = useState(null); // State to store item details
  const [loading, setLoading] = useState(true); // Loading state
  const [reviews, setReviews] = useState([]); // State to store reviews

  // Fetch item details from Firebase when the component mounts
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const dbRef = ref(db, `Menu/${category}/${item}`); // Reference to the specific item in the database
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          setItemDetails(snapshot.val()); // Store item details in state
        } else {
          console.log("Item not found");
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setLoading(false); // Set loading to false when the data is fetched
      }
    };

    fetchItemDetails();
  }, [item, category]);

  // Fetch reviews from Firebase
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRef = ref(db, 'Reviews/');
        const snapshot = await get(reviewsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const filteredReviews = Object.values(data).filter(review => review.orderNumber === item);
          setReviews(filteredReviews); // Store reviews in state
        } else {
          console.log("No reviews found for this item");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [item]);

  const handleAddToCart = () => {
    console.log('Item added to cart');
    // Logic for adding the item to the cart can be implemented here
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#223d3c" />
        <Text>Loading item details...</Text>
      </View>
    );
  }

  if (!itemDetails) {
    return (
      <View style={styles.container}>
        <Text>Item not found</Text>
      </View>
    );
  }

  const { item: itemName, description = 'No description available', price = 0, img = '' } = itemDetails; // Destructure item details

  return (
    <View style={styles.container}>
      <Image source={{ uri: img || 'https://via.placeholder.com/250' }} style={styles.productImage} />

      <Text style={styles.productName}>{itemName}</Text>

      <Text style={styles.productDescription}>{description}</Text>

      <Text style={styles.productPrice}>R {price.toFixed(2)}</Text>

      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
        <Text style={styles.addToCartText}>ADD TO CART</Text>
      </TouchableOpacity>

      {/* Reviews Section */}
      <Text style={styles.reviewsTitle}>Reviews</Text>
      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={({ item }) => (
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewOrder}>Order: {item.orderNumber}</Text>
              <Text style={styles.reviewText}>{item.reviewText}</Text>
              <Text style={styles.reviewRating}>Rating: {item.rating}/5</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text>No reviews available for this item.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#223d3c',
    textAlign: 'center',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#7e7e7e',
    textAlign: 'center',
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  addToCartButton: {
    backgroundColor: '#223d3c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#223d3c',
  },
  reviewContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  reviewOrder: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  reviewRating: {
    fontSize: 14,
    color: '#777',
  },
});

export default ItemDetails;
