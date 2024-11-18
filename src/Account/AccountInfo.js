import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Alert, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, verifyBeforeUpdateEmail } from 'firebase/auth';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '../Screen/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AccountInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newSurname, setNewSurname] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const navigation = useNavigation();
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const currentUser = getAuth().currentUser;
        if (currentUser) {
          const emailKey = currentUser.email.replace(/\./g, '_');
          const snapshot = await get(ref(db, `users/${emailKey}`));
          if (snapshot.exists()) {
            setUserInfo(snapshot.val());
          }
        }
      } catch (error) {
        console.error('Error fetching user info: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const updateUserInfo = async (field, value) => {
    const nameRegex = /^[a-zA-Z]+$/;
    if (field === 'name' || field === 'surname') {
      if (!nameRegex.test(value)) {
        Alert.alert('Error', 'Name and Surname should contain only letters.');
        return;
      }
    }

    const currentUser = getAuth().currentUser;
    if (currentUser) {
      const emailKey = currentUser.email.replace(/\./g, '_');
      try {
        const userRef = ref(db, `users/${emailKey}`);
        await set(userRef, { ...userInfo, [field]: value });
        setUserInfo((prev) => ({ ...prev, [field]: value }));
      } catch (error) {
        Alert.alert('Error', `Failed to update ${field}.`);
        console.error(`Error updating ${field}: `, error);
      }
    }
  };

  const handleSendVerification = async () => {
    if (!newEmail) {
      setError('Please enter a valid new email.');
      return;
    }
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('No user is logged in.');
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      await verifyBeforeUpdateEmail(user, newEmail);

      await AsyncStorage.setItem('newEmail', newEmail);

      setIsVerificationSent(true);
      Alert.alert(
        'Verification Email Sent',
        'A verification email has been sent to your new email address. Please check your inbox and verify the email.'
      );
    } catch (error) {
      setError(error.message);
      console.log('Error during email update:', error.code, error.message);
    } finally {
      setLoading(false);
    }
    updateDatabase();
    navigation.navigate('LogOut');
  };

  const updateDatabase = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
  
      if (!currentUser) {
        Alert.alert('Error', 'No user is currently logged in.');
        return;
      }
  
      // Current email key with Firebase-friendly format
      const currentEmailKey = currentUser.email.replace(/\./g, '_');
      
      // Reference to the current user data in the database
      const userRef = ref(db, `users/${currentEmailKey}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        Alert.alert('Error', 'User not found in the database.');
        return;
      }
      // New email key with Firebase-friendly format
      const newEmailKey = newEmail.replace(/\./g, '_');
      // Save the user data under the new email key
      await set(ref(db, `users/${newEmailKey}`), {
        ...snapshot.val(),
        email: newEmail,
      });
      // Remove the old email entry
      await remove(userRef);

      //Cart update...
      const cartRef = ref(db, `cart/${currentEmailKey}`);
      const cartSnapshot = await get(cartRef);
      if (cartSnapshot.exists()) {
        await set(ref(db, `Carts/${newEmailKey}`), cartSnapshot.val());
        await remove(cartRef);
      }

      //Order update....
      const ordersRef = ref(db, `Orders`);
    const ordersSnapshot = await get(ordersRef);
    if (ordersSnapshot.exists()) {
      const ordersData = ordersSnapshot.val();
      for (const orderKey in ordersData) {
        const order = ordersData[orderKey];
        if (order.email.replace(/\./g, '_') === currentEmailKey) {
          await set(ref(db, `Orders/${orderKey}`), {
            ...order,
            email: newEmail,
          });
        }
      }
    }
    //booking databe
    const bookingsRef = ref(db, `bookings`);
    const bookingsSnapshot = await get(bookingsRef);
    if (bookingsSnapshot.exists()) {
      const bookingsData = bookingsSnapshot.val();
      for (const bookingKey in bookingsData) {
        const booking = bookingsData[bookingKey];
        if (booking.email.replace(/\./g, '_') === currentEmailKey) {
          await set(ref(db, `bookings/${bookingKey}`), {
            ...booking,
            email: newEmail,
          });
        }
      }
    }

      // Update 'deletion' database
      const deletionRef = ref(db, `deletion`);
      const deletionSnapshot = await get(deletionRef);
      if (deletionSnapshot.exists()) {
        const deletionData = deletionSnapshot.val();
        for (const deletionKey in deletionData) {
          const deletion = deletionData[deletionKey];
          if (deletion.email.replace(/\./g, '_') === currentEmailKey) {
            await set(ref(db, `deletion/${deletionKey}`), {
              ...deletion,
              email: newEmail,
            });
          }
        }
      }
  
      Alert.alert('Success', 'Email has been successfully updated in the database.');
    } catch (error) {
      console.error('Error updating email in database:', error);
      Alert.alert('Error', 'Failed to update email in database.');
    }
  };
  
  

  useEffect(() => {
    const checkForVerifiedEmail = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.email === newEmail && isVerificationSent) {
        setIsVerificationSent(false);
      }
    };
    checkForVerifiedEmail();
  }, [newEmail, isVerificationSent]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  if (!userInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text>No user information available.</Text>
      </View>
    );
  }

  const initials = userInfo.name.charAt(0).toUpperCase() + userInfo.surname.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContainerr}>
      <Text style={styles.title}>Account Info</Text>
      <View style={styles.initialsContainer}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{userInfo.name} {userInfo.surname}</Text>
      </View>

      {isUpdatingName ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter new name"
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter new surname"
            value={newSurname}
            onChangeText={setNewSurname}
          />
          <TouchableOpacity style={styles.saveButton} onPress={() => { 
            updateUserInfo('name', newName); 
            updateUserInfo('surname', newSurname); 
            setIsUpdatingName(false);
          }}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsUpdatingName(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsUpdatingName(true)} style={styles.button}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.label}>Currently logged in as: </Text> 
      <Text style={styles.value}>{userInfo.email}</Text>

      <Text style={styles.label}>Enter your New Email</Text>
      <TextInput
        style={styles.input}
        value={newEmail}
        onChangeText={setNewEmail}
        placeholder="New Email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Enter your Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSendVerification}>
          <Text style={styles.buttonText}>Send Verification Email</Text>
        </TouchableOpacity>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
     flex: 1,
      padding: 16,
      backgroundColor: '#fff',

     },
     containerr: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
  loading: {
     flex: 1,
      justifyContent: 'center' },
  errorContainer: { 
    flex: 1,
     justifyContent: 'center', 
     alignItems: 'center'
     },
  title: {fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'serif',
    color: '#082c24',
   },
  initialsContainer: { 
    justifyContent: 'center', 
    alignItems: 'center',
     marginVertical: 16,
     borderRadius: 50,
     height: 100,
     width: 100,
     backgroundColor: '#223d3c',
    },
  initialsText: { 
    fontSize: 48,
     fontWeight: 'bold',
     color: 'white'
    },
  userInfo: { 
    marginBottom: 16
   },
  label: { 
    fontSize: 16,
     fontWeight: 'bold',
    color: 'black',
   },
  value: { 
    fontSize: 16,
    color: 'black',
  textAlign:'right',
  marginBottom: 5,
  },
  input: { 
   borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    color: 'black',
    width: '100%',
    marginBottom: 5,
    color: 'black',
  },
  button: { 
    backgroundColor: '#223d3c',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 1, // Adjusted margin to move it up a bit
    width: '100%', 
    marginTop: 5,
  },
  saveButton: { 
    backgroundColor: '#28a745', 
   paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 1, // Adjusted margin to move it up a bit
    width: '100%', 
    marginTop: 5,
  },
  cancelButton: { 
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 1, // Adjusted margin to move it up a bit
    width: '100%', 
    marginTop: 5,},
  buttonText: { 
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
   },
  error: { color: 'red',
     marginVertical: 4 },
});

export default AccountInfo;
        
