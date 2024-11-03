import React from 'react';
import { View, Text, StyleSheet, Alert,TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Security = () => {
  const navigation = useNavigation();

  const showAlert = () => {
    Alert.alert("Feature Coming Soon!", "This feature is currently under development.");
  };
  
 

  return (
   <View style={styles.container}>
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('DeleteAccount')}>
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.description}>Your account will permanently be deleted from our system</Text>
        <Image source={require('../assets/next.png')} style={{ width: 30, height: 30,  marginLeft:330, }} />
        </TouchableOpacity>
      
 <TouchableOpacity style={styles.option} onPress={showAlert}>
        <Text style={styles.title}>Multi-factor enrollment</Text>
        <Text style={styles.description}>Add additional security to your account with 2-step verification</Text>
        <Image source={require('../assets/next.png')} style={{ width: 30, height: 30, marginLeft: 330 }} />
      </TouchableOpacity>

 <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('UpdatePassword')}>
        <Text style={styles.title}>Update Password</Text>
        <Text style={styles.description}>Change your password to secure your account</Text>
        <Image source={require('../assets/next.png')} style={{ width: 30, height: 30, marginLeft:330, }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
    marginBottom: 15,
    height: 127,
    marginRight:10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 1,
    marginBottom: 1,
    fontFamily: 'serif',  // Custom font

  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    flex: 1,
    marginBottom: 1,
  },
  icon: {
    marginLeft: 325,

  },
});

export default Security;
