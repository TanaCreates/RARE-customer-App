import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, set, push } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NextPage = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [assignedPods, setAssignedPods] = useState([]);
  const route = useRoute();
  const { selectedDate = '', selectedSlots = [], numPods } = route.params;
  const [formattedEmail, setFormattedEmail] = useState(null); // Added this to store formatted email
  console.log('Slots:', selectedSlots);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserEmail(currentUser.email);
      const emailFormatted = currentUser.email.replace(/\./g, '_'); // Replace dots with underscores
      setFormattedEmail(emailFormatted);
    }
    fetchAvailablePods();
  }, []);

  const fetchAvailablePods = async () => {
    const db = getDatabase();
    const podRef = ref(db, 'sleepingPods');
    try {
      const snapshot = await get(podRef);
      if (snapshot.exists()) {
        const pods = snapshot.val();
        const availablePods = Object.values(pods)
          .filter((pod) => pod.availability === true)
          .map((pod) => ({ ...pod, price: Number(pod.price) }));

        if (availablePods.length >= numPods) {
          setAssignedPods(availablePods.slice(0, numPods));
        } else {
          Alert.alert('Not Enough Available Pods', `Only ${availablePods.length} pods are available.`);
        }
      } else {
        Alert.alert('No Pods Found', 'There are no sleeping pods in the database.');
      }
    } catch (error) {
      console.error('Error fetching pods:', error);
      Alert.alert('Error', 'Could not fetch available sleeping pods.');
    }
  };

  // Function to add pods to cart in Firebase
  const handleAddToCart = async () => {
    if (!formattedEmail) {
      console.error('No user email found, cannot add to cart');
      return;
    }

    const db = getDatabase();
    const cartRef = ref(db, `Carts/${formattedEmail}`);

    try {
      assignedPods.forEach((pod) => {
        const newCartItemRef = push(cartRef); // Push each pod as a new cart item
        set(newCartItemRef, {
          podId: pod.podId,
          numPods: numPods, // Number of pods the user is booking
          roomNumber: pod.bedNumber,
          price: pod.price,
          totalPrice: pod.price * numPods, // Assuming total price is price * number of pods
        }).catch((error) => {
          console.error('Failed to add pod to the cart:', error);
        });
      });

      Alert.alert('Added to Cart', 'Your pod has been added to the cart.');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Could not add the pod to the cart.');
    }
  };

  const handleConfirmBooking = async () => {
    const db = getDatabase();
    const now = new Date();
    const southAfricanDate = now.toLocaleDateString('en-ZA');
    const southAfricanTime = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

    const generateBookingNumber = () => {
      return Math.floor(1000 + Math.random() * 9000);
    };

    const checkInTimes = selectedSlots.map((slot) => new Date(slot));
    const checkInTime = new Date(Math.min(...checkInTimes));
    const totalHours = selectedSlots.length;
    const checkOutTime = new Date(checkInTime.getTime() + totalHours * 60 * 60 * 1000);

    const bookingData = {
      bookingNumber: generateBookingNumber(),
      email: userEmail,
      selectedDate: selectedDate,
      checkInTime: checkInTime.toTimeString().slice(0, 5),
      checkOutTime: checkOutTime.toTimeString().slice(0, 5),
      podId: assignedPods.map((pod) => pod.podId),
      bedNumbers: assignedPods.map((pod) => pod.bedNumber),
      prices: assignedPods.map((pod) => pod.price),
      totalPrice: assignedPods.reduce((total, pod) => total + pod.price, 0),
      bookingDate: southAfricanDate,
      bookingTime: southAfricanTime,
    };

    try {
      const bookingRef = ref(db, 'bookings');
      const newBookingRef = push(bookingRef);
      await set(newBookingRef, bookingData);
      Alert.alert('Booking Confirmed', 'Your booking has been confirmed!');
    } catch (error) {
      console.error('Error confirming booking:', error);
      Alert.alert('Error', 'Could not confirm your booking.');
    }
  };

  const totalPrice = assignedPods.reduce((total, pod) => total + pod.price, 0);

  const checkInTimes = selectedSlots.map((slot) => new Date(slot));
  const checkInTime = checkInTimes.length > 0 ? new Date(Math.min(...checkInTimes)) : null;
  const totalHours = selectedSlots.length;
  const checkOutTime = checkInTime ? new Date(checkInTime.getTime() + totalHours * 60 * 60 * 1000) : null;

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Booking Details</Text>
        <View style={styles.container2}>
          <Text style={styles.label}>User Email: {userEmail || 'No Email'}</Text>
          <Text style={styles.infoText}>
            <Icon name="calendar-today" size={24} color="#fff" style={styles.calendarIcon} /> Selected Date: {selectedDate}
          </Text>
          <Text style={styles.infoText}>Number of Pods: {numPods}</Text>

          {selectedSlots.length > 0 ? (
            <View style={styles.slotContainer}>
              <Text style={styles.slotText}>Check-in: {checkInTime && checkInTime.toTimeString().slice(0, 5)}</Text>
              <Text style={styles.slotText}>Check-out: {checkOutTime && checkOutTime.toTimeString().slice(0, 5)}</Text>
              <Text style={styles.slotText}>Duration: {totalHours} hour{totalHours !== 1 ? 's' : ''}</Text>
            </View>
          ) : (
            <Text style={styles.infoText}>No slots selected.</Text>
          )}

          {assignedPods.length > 0 ? (
            assignedPods.map((pod, index) => (
              <View key={index} style={styles.podContainer}>
                <Text style={styles.podText}>Assigned Pod:</Text>
                <Text style={styles.podText}>Pod ID: {pod.podId}</Text>
                <Text style={styles.podText}>Room Number: {pod.bedNumber}</Text>
                <Text style={styles.podText}>Price: {pod.price} ZAR</Text>
              </View>
            ))
          ) : (
            <Text style={styles.infoText}>No pods assigned.</Text>
          )}
        </View>
        <Text style={styles.totalPriceText}>Total Price: {totalPrice} ZAR</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
          <Text style={styles.buttonText}>Book now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  container2: {
    borderRadius: 15,
    backgroundColor: '#223D3C',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: 'white',
  },
  slotContainer: {
    marginVertical: 5,
  },
  slotText: {
    fontSize: 16,
  },
});

export default NextPage;
