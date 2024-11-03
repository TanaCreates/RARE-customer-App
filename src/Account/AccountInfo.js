import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../Screen/firebase'; // Adjust the import based on your folder structure
import { ref, child, get, set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
//import AccountNav from './AccountNav';  

const AccountInfo = () => {

  const navigation = useNavigation();

  const Account = () => {
    navigation.navigate("Account", { screen: "Account" });
  };


  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState(''); 
  const [newSurname, setNewSurname] = useState(''); 
  const [newEmail, setNewEmail] = useState(''); 
  const [isUpdatingName, setIsUpdatingName] = useState(false); 
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false); 

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
            setNewEmail(userData.email); 
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

  const handleUpdateName = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const email = currentUser.email;
        const formattedEmail = email.replace(/\./g, '_');

        // Update user data in the database
        const userRef = ref(db, `users/${formattedEmail}`);
        await set(userRef, {
          ...userInfo,
          name: newName,
          surname: newSurname,
          email: userInfo.email, // Keep the old email
        }); 

        // Update local state
        setUserInfo((prev) => ({ ...prev, name: newName, surname: newSurname }));
        setNewName(''); 
        setNewSurname(''); 
        setIsUpdatingName(false); 
        Alert.alert('Success', 'Name and surname updated successfully!');
      }
    } catch (error) {
      console.error("Error updating user info: ", error);
      Alert.alert('Error', 'Failed to update name and surname.');
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const email = currentUser.email;
        const formattedEmail = email.replace(/\./g, '_');

        // Update user data in the database
        const userRef = ref(db, `users/${formattedEmail}`);
        await set(userRef, {
          ...userInfo,
          name: userInfo.name, 
          surname: userInfo.surname, 
          email: newEmail,
        }); 

        // Update local state
        setUserInfo((prev) => ({ ...prev, email: newEmail }));
        setNewEmail(''); 
        setIsUpdatingEmail(false); 
        Alert.alert('Success', 'Email updated successfully!');

        // Update email authentication if necessary
        if (newEmail !== email) {
          await currentUser.updateEmail(newEmail); 
        }
      }
    } catch (error) {
      console.error("Error updating email: ", error);
      Alert.alert('Error', 'Failed to update email.');
    }
  };

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

  return (
    <View style={styles.container}>
   
      <Text style={styles.title}>Account Info</Text>
      <Text style={styles.subtitle}>Basic Information</Text>

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
            onChangeText={(text) => setNewName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter new surname"
            value={newSurname}
            onChangeText={(text) => setNewSurname(text)}
          />
          <Button title="Save Name and Surname" onPress={handleUpdateName} />
          <Button title="Cancel" color="red" onPress={() => setIsUpdatingName(false)} />
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsUpdatingName(true)} style={styles.button}>
          <Text style={styles.buttonText}>Update Name and Surname</Text>
        </TouchableOpacity>
      )}

      <View style={styles.userInfo}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userInfo.email}</Text>
      </View>

      {isUpdatingEmail ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter new email"
            value={newEmail}
            onChangeText={(text) => setNewEmail(text)}
            keyboardType="email-address"
          />
          <Button title="Save Email" onPress={handleUpdateEmail} />
          <Button title="Cancel" color="red" onPress={() => setIsUpdatingEmail(false)} />
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsUpdatingEmail(true)} style={styles.button}>
          <Text style={styles.buttonText}>Update Email</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'serif',  // Custom font

  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  button: {
    backgroundColor: '#223d3c',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccountInfo;

