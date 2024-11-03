import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth, db } from '../Screen/firebase'; // Adjust the import based on your file structure
import { ref, get, child } from 'firebase/database';

const Header = () => {
  const [userInfo, setUserInfo] = useState({ name: '', surname: '' });
  const [cartCount, setCartCount] = useState(0); // Example state for cart count, update as needed
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const email = currentUser.email;
          const formattedEmail = email.replace(/\./g, '_'); // Replace dots with underscores

          const dbRef = ref(db);
          const snapshot = await get(child(dbRef, `users/${formattedEmail}`)); // Query by formatted email

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

    fetchUserInfo();
  }, []);

  return (
    <View style={styles.headerContainer}>
      
      {/* Title with User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.label}>Hello,</Text>
        <Text style={styles.userName}>{loading ? 'Loading...' : `${userInfo.name}  ${userInfo.surname}`}</Text>
      </View>
    </View>
  );
};

// Add your styles using StyleSheet
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    height: 150,
    borderRadius:25,
    backgroundColor: '#223d3c',
  },
  iconContainer: {
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    alignItems: 'center',
    
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
  },
  userName: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#ffffff',
  },

 
});

export default Header;
