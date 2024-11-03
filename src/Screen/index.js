import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '../utils/colors';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const navigation = useNavigation();

  const Login = () => { navigation.navigate("Login"); }
  const SignUp = () => { navigation.navigate("SignUp"); }

  return (
    <View style={styles.container}>
      <Image source={require("../assets/HomeLogo.png")} style={styles.logo} />
      <Image source={require("../assets/HomeText.png")} style={styles.hometext} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={Login}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={SignUp}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center', // Center the content vertically
  },
  logo: {
    height: 140,
    width: 220,
    marginBottom: 20, // Reduced margin to make it closer to the text
  },
  hometext: {
    height: 200,
    width: 300,
    marginBottom: 40, // Reduced margin for better spacing
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Evenly distribute buttons
    width: '60%', // Use a percentage for better responsiveness
    height: 60,
  },
  button: {
    flex: 1, // Make buttons fill the available space
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderRadius: 10,
    borderColor: colors.green,
    marginHorizontal: 3, // Space between buttons
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    backgroundColor: colors.green,
    borderRadius: 10,
    width: '100%', // Full width of the button
    height: 55,
    textAlign: 'center', // Center text
    lineHeight: 55, // Center text vertically
  },
  signupButtonText: {
    color: colors.green, // Make the text color green for visibility
    fontSize: 18,
    textAlign: 'center', // Center text
  }
});
