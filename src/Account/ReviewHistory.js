import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getDatabase, ref, child, get } from 'firebase/database';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { app } from '../Screen/firebase';
import { getAuth } from 'firebase/auth';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [showOrders, setShowOrders] = useState(true);
  const navigation = useNavigation();

  const getUserEmail = () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      return user.email.replace(/\./g, '_');
    }
    return null;
  };

  const fetchOrderHistory = async () => {
    const email = getUserEmail();
    if (!email) {
      console.log("User is not authenticated.");
      setLoading(false);
      return;
    }

    const dbRef = ref(getDatabase(app));

    try {
      setLoading(true);
      const userSnapshot = await get(child(dbRef, `users/${email}`));
      if (!userSnapshot.exists()) {
        console.log("No user data found for the specified email.");
        setLoading(false);
        return;
      }

      const orderSnapshot = await get(child(dbRef, 'Orders/'));
      let orderList = [];
      if (orderSnapshot.exists()) {
        const data = orderSnapshot.val();
        orderList = Object.entries(data)
          .map(([id, order]) => {
            const filteredItems = order.items.filter(item => item.itemName !== "SleepingPod" && item.itemName !== "Sleeping Pod");
            const filteredTotalPrice = filteredItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
            return {
              id,
              orderNumber: order.orderNumber,
              collected: order.collected,
              items: filteredItems,
              totalPrice: filteredTotalPrice,
              email: order.email,
            };
          })
          .filter(order => order.email && order.email.trim().toLowerCase() === email.replace(/_/g, '.').toLowerCase());
      }

      const bookingSnapshot = await get(child(dbRef, 'bookings/'));
      let bookingList = [];
      if (bookingSnapshot.exists()) {
        const data = bookingSnapshot.val();
        bookingList = Object.entries(data)
          .map(([id, booking]) => ({
            id,
            ...booking,
          }))
          .filter(booking => booking.email && booking.email.trim().toLowerCase() === email.replace(/_/g, '.').toLowerCase());
      }
      setOrders(orderList);
      setBookings(bookingList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    const dbRef = ref(getDatabase(app));

    try {
      const hotBeveragesSnapshot = await get(child(dbRef, 'Menu/Hot Beverages/'));
      const coldBeveragesSnapshot = await get(child(dbRef, 'Menu/Cold Beverages/'));

      let itemsArray = [];

      if (hotBeveragesSnapshot.exists()) {
        itemsArray = itemsArray.concat(
          Object.values(hotBeveragesSnapshot.val()).map(item => item.item)
        );
      }

      if (coldBeveragesSnapshot.exists()) {
        itemsArray = itemsArray.concat(
          Object.values(coldBeveragesSnapshot.val()).map(item => item.item)
        );
      }

      setMenuItems(itemsArray);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setOrders([]);
      setBookings([]);
      setLoading(true);
      fetchOrderHistory();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleReview = (id, type) => {
    navigation.navigate('Review', { id, type });
  };

  const isMenuItem = (itemName) => {
    return menuItems.includes(itemName);
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.verticalBar} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>Order Number: {item.orderNumber}</Text>
        {item.items.map((subItem, index) => (
          <View key={index}>
            <Text style={styles.itemText}>Item: {subItem.itemName}</Text>
            <Text style={styles.itemText}>Item Price: R{subItem.price}</Text>
            <Text style={styles.itemText}>Quantity: {subItem.quantity}</Text>
            <Text style={styles.itemText}>Total Price: R{subItem.totalPrice}</Text>
            <Text style={styles.itemText}>Collected: {item.collected ? "Yes" : "No"}</Text>

            {!item.orderNumber && !isMenuItem(subItem.itemName) && (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => handleReview(item.id, 'order')}
              >
                <Text style={styles.buttonText}>Review</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderBookingItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.verticalBar} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>Booking Number: {item.bookingNumber}</Text>
        <Text style={styles.itemText}>Number of Beds: {item.numberOfPods}</Text>
        <Text style={styles.itemText}>Arrived: {item.arrived ? "Yes" : "No"}</Text>
        <Text style={styles.itemText}>Total Price: R{item.totalPrice}</Text>
        {!item.Reviews && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => handleReview(item.id, 'booking')}
          >
            <Text style={styles.buttonText}>Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      ListHeaderComponent={
        <View>
          <Text style={styles.header}> History</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, showOrders && styles.activeButton]}
              onPress={() => setShowOrders(true)}
            >
              <Text style={styles.buttonText}>Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !showOrders && styles.activeButton]}
              onPress={() => setShowOrders(false)}
            >
              <Text style={styles.buttonText}>Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      data={showOrders ? orders : bookings}
      keyExtractor={(item) => item.id}
      renderItem={showOrders ? renderOrderItem : renderBookingItem}
      ListFooterComponent={
        <Text style={styles.infoText}>You can only leave a review on your existing purchases or bookings.</Text>
      }
      contentContainerStyle={styles.scrollContainer}
    />
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    color: '#000000', // Black text
    marginBottom: 10,
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 10,
    backgroundColor: '#eee',
    borderRadius: 25,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#223D3C',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#ffffff', // White background
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemDetails: {
    flex: 1,
    paddingLeft: 15,
  },
  reviewButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#223D3C',
    borderRadius: 25,
  },
  itemText: {
    color: '#000000', // Black text
    fontSize: 16,
    marginBottom: 5,
  },
  verticalBar: {
    width: 3,
    backgroundColor: '#223D3C',
    marginHorizontal: 15,
  },
  infoText: {
    textAlign: 'center',
    color: '#000000', // Black text
    fontSize: 14,
    marginTop: 20,
  },
});

export default OrderHistory;
