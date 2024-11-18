import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { db, auth } from '../Screen/firebase';
import { ref, onValue, push, set, child, get } from 'firebase/database';

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
  const [userInfo, setUserInfo] = useState(null);
  const [bookingFound, setBookingFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const email = currentUser.email;
          const formattedEmail = email.replace(/\./g, '_');
          const dbRef = ref(db);
          const snapshot = await get(child(dbRef, `users/${formattedEmail}`));

          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserInfo(userData);
          } else {
            setError("No user data found.");
          }
        }
      } catch (error) {
        console.error("Error fetching user info: ", error);
        setError("Failed to fetch user information.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

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
    if (!userInfo) {
      Alert.alert('User info not loaded yet.');
      return;
    }

    setLoading(true);
    const bookingsRef = ref(db, 'bookings');
    onValue(bookingsRef, (snapshot) => {
      let found = false;
      const today = new Date();

      snapshot.forEach((childSnapshot) => {
        const booking = childSnapshot.val();

        if (booking.bookingNumber === Number(bookingNumber)) {
          found = true;
          const bookingDate = new Date(booking.bookingDate);

          if (bookingDate.toDateString() === today.toDateString()) {
            setBookingFound(true);
          } else if (bookingDate < today) {
            Alert.alert(`Booking number ${bookingNumber} has expired.`);
          } else {
            Alert.alert('Booking found, but it is not for today.');
          }
        }
      });

      if (!found) {
        resetBookingState();
        Alert.alert('No booking found for this booking number.');
      }
      setLoading(false);
    });
  };

  const resetBookingState = () => {
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
      email: userInfo.email,
      name: userInfo.name,
      submittedDate: now.toLocaleDateString(),
      submittedTime: now.toLocaleTimeString(),
    };

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
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome to Sleeping Pod Request Form</Text>
          {error && <Text style={styles.errorMessage}>{error}</Text>}
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
            <TouchableOpacity
              onPress={() => fetchBookingByNumber(bookingNumber)}
              style={styles.button}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Fetching...' : 'Fetch Booking'}</Text>
            </TouchableOpacity>
            {loading && <ActivityIndicator size="small" color="#082c24" />}
          </View>

          {bookingFound && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                  style={styles.input}
                  value={userInfo.email}
                  placeholder="Email"
                  editable={false}
                />
              </View>

              <View style={styles.requestSection}>
                <Text style={styles.label}>Requests:</Text>
                {['blanket', 'extraStorage', 'pillows'].map((item) => (
                  <View key={item} style={styles.radioInputGroup}>
                    <Text>{item.charAt(0).toUpperCase() + item.slice(1)}:</Text>
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        onPress={() => handleChange(item, 'no')}
                        style={[
                          styles.radioButton,
                          { backgroundColor: requestData[item] === 'no' ? '#082c24' : '#ccc' },
                        ]}
                      >
                        <Text style={styles.radioButtonText}>No</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleChange(item, 'yes')}
                        style={[
                          styles.radioButton,
                          { backgroundColor: requestData[item] === 'yes' ? '#082c24' : '#ccc' },
                        ]}
                      >
                        <Text style={styles.radioButtonText}>Yes</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.quantityInput}
                      value={quantities[item].toString()}
                      onChangeText={(text) => handleQuantityChange(item, text)}
                      placeholder="Quantity"
                      keyboardType="numeric"
                      editable={requestData[item] === 'yes'}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity onPress={handleAddRequest} disabled={!bookingFound} style={styles.button}>
                <Text style={styles.buttonText}>Submit Request</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'serif',  // Custom font
  },
  inputGroup: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#082c24',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    color: 'black',
    width: '100%',
    marginBottom: 25,
  },
  requestSection: {
    marginTop: 10,
  },
  radioInputGroup: {
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  radioButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    alignItems: 'center',
  },
  radioButtonText: {
    color: 'white',
  },
  quantityInput: {
    marginTop: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#ffffff',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default CustomerRequestForm;
