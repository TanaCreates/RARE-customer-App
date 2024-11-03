import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { db } from '../Screen/firebase'; // Adjust the import based on your file structure
import { ref, onValue, push, set } from 'firebase/database';

const CustomerRequestForm = () => {
  const [requestData, setRequestData] = useState({
    blanket: '',
    extraStorage: '',
    pillows: '',
  });

  const [quantities, setQuantities] = useState({
    blanket: 0,
    extraStorage: 0,
    pillows: 0,
  });

  const [bookingNumber, setBookingNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [podId, setPodId] = useState('');
  const [bookingFound, setBookingFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setRequestData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleQuantityChange = (name, value) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [name]: Number(value),
    }));
  };

  const fetchBookingByNumber = async (bookingNumber) => {
    setLoading(true);
    const bookingsRef = ref(db, 'bookings');
    onValue(bookingsRef, (snapshot) => {
      let found = false;
      snapshot.forEach((childSnapshot) => {
        const booking = childSnapshot.val();
        if (booking.bookingNumber === bookingNumber) {
          setEmail(booking.email);
          setName(booking.name); // Assuming there's a 'name' field in your bookings structure
          setBookingFound(true);
          found = true;
        }
      });
      if (!found) {
        resetBookingState();
        Alert.alert('No booking found for this booking number.');
      } else {
        Alert.alert('Booking found! Please proceed.');
      }
      setLoading(false);
    });
  };

  const resetBookingState = () => {
    setEmail('');
    setName('');
    setBookingFound(false);
  };

  const handleAddRequest = async () => {
    if (!bookingFound) {
      Alert.alert('Please fetch your booking first.');
      return;
    }

    const requestId = push(ref(db, 'requests')).key;
    const now = new Date();
    const requestPayload = {
      ...requestData,
      quantities,
      email,
      name,
      submittedDate: now.toLocaleDateString(),
      submittedTime: now.toLocaleTimeString(),
    };

    // Validate quantities before submission
    for (const key in quantities) {
      if (requestData[key] === 'yes' && quantities[key] <= 0) {
        Alert.alert(`Please enter a valid quantity for ${key}.`);
        return;
      }
    }

    try {
      await set(ref(db, `requests/${requestId}`), requestPayload);
      Alert.alert('Request added successfully!');
      resetForm();
    } catch (error) {
      console.error('Error adding request:', error);
      Alert.alert('Could not add request');
    }
  };

  const resetForm = () => {
    setRequestData({
      blanket: '',
      extraStorage: '',
      pillows: '',
    });
    setQuantities({
      blanket: 0,
      extraStorage: 0,
      pillows: 0,
    });
    setBookingNumber('');
    resetBookingState();
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Welcome to Customer Service</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Booking Number:</Text>
          <TextInput
            style={styles.input}
            value={bookingNumber}
            onChangeText={(text) => {
              setBookingNumber(text);
              resetBookingState();
            }}
            placeholder="Enter Booking Number"
            keyboardType="numeric"
          />
          <Button
            title={loading ? 'Fetching...' : 'Fetch Booking'}
            onPress={() => fetchBookingByNumber(bookingNumber)}
            disabled={loading}
          />
          {loading && <ActivityIndicator />}
        </View>

        {bookingFound && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.input}
                value={name}
                placeholder="Enter Name"
                readOnly // Name is set from booking data
              />
            </View>

            <View style={styles.requestSection}>
              <Text style={styles.label}>Requests:</Text>
              {['blanket', 'extraStorage', 'pillows'].map((item) => (
                <View key={item} style={styles.radioInputGroup}>
                  <Text>{item.charAt(0).toUpperCase() + item.slice(1)}:</Text>
                  <View style={styles.radioGroup}>
                    <Button
                      title="No"
                      onPress={() => handleChange(item, 'no')}
                      disabled={!bookingFound}
                      color={requestData[item] === 'no' ? '#007BFF' : '#ccc'}
                    />
                    <Button
                      title="Yes"
                      onPress={() => handleChange(item, 'yes')}
                      disabled={!bookingFound}
                      color={requestData[item] === 'yes' ? '#007BFF' : '#ccc'}
                    />
                  </View>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantities[item].toString()}
                    onChangeText={(text) => handleQuantityChange(item, text)}
                    keyboardType="numeric"
                    placeholder="Quantity"
                    disabled={requestData[item] === 'no' || !bookingFound}
                  />
                </View>
              ))}
            </View>

            <Button
              title="Submit Request"
              onPress={handleAddRequest}
              disabled={!bookingFound}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  formContainer: {
    margin: 'auto',
    maxWidth: 600,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  requestSection: {
    marginVertical: 10,
  },
  radioInputGroup: {
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default CustomerRequestForm;
