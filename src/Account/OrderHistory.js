import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { getDatabase, ref, child, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const auth = getAuth();

  const fetchUserInfo = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const email = currentUser.email;
        const formattedEmail = email.replace(/\./g, '_');

        const dbRef = ref(getDatabase());
        const snapshot = await get(child(dbRef, `users/${formattedEmail}`));

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserInfo(userData);
        } else {
          console.log("No user data found at path users/" + formattedEmail);
        }
      }
    } catch (error) {
      console.error("Error fetching user info: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!userInfo) return;

      const dbRef = ref(getDatabase());
      try {
        const snapshot = await get(child(dbRef, 'Orders/'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const orderList = Object.entries(data)
            .map(([id, order]) => ({
              id,
              ...order,
            }))
            .filter(order => order.email.trim().toLowerCase() === userInfo.email.trim().toLowerCase());

          if (orderList.length > 0) {
            setOrders(orderList);
          } else {
            console.log("No orders found for this email.");
          }
        } else {
          console.log("No order history found in database.");
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [userInfo]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleReview = (id) => {
    navigation.navigate('Review', { orderId: id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order History</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text>Order Number: {item.orderNumber}</Text>
            <Text>Date: {new Date(item.timestamp).toLocaleDateString()}</Text>
            <Text>Total Price: R{item.totalPrice}</Text>

            {/* Safely check if items is defined and is an array */}
            {Array.isArray(item.items) ? (
              item.items.map((orderItem, index) => (
                <View key={index} style={styles.itemDetails}>
                  <Text>Item: {orderItem.item}</Text>
                  <Text>Category: {orderItem.category}</Text>
                  <Text>Quantity: {orderItem.quantity}</Text>
                  <Text>Price: R{orderItem.price}</Text>
                </View>
              ))
            ) : (
              <Text>No items found for this order.</Text>
            )}
<View style={styles.button}>
            <Button
              title={item.Reviews ? "Reviewed" : "REVIEW"}
              onPress={() => handleReview(item.id)}
              disabled={item.Reviews}
            />

            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No orders found for this account.</Text>}
      />
      <Text style={styles.infoText}>You can only leave a review on your existing purchases.</Text>
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
    fontFamily: 'serif',  // Custom font
    marginLeft: 90,

  },
  orderItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  itemDetails: {
    marginTop: 10,
  },
  infoText: {
    marginTop: 20,
    textAlign: 'center',
  },
});

export default OrderHistory;
