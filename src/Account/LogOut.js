import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const Logout = () => {
  const auth = getAuth(); // Get the Firebase Auth instance
  const navigation = useNavigation(); // Use navigation to redirect

  useEffect(() => {
    // Function to log out the user
    const handleLogout = async () => {
      try {
        await signOut(auth); // Firebase sign-out method
        navigation.navigate('Login'); // Navigate to the login screen
      } catch (error) {
        console.error("Error logging out: ", error);
      }
    };

    handleLogout(); // Call the logout function when component mounts
  }, [auth, navigation]); // Add auth and navigation to dependency array

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Logging out...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
  },
});

export default Logout;
